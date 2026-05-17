export function cleanJavaSource(source, fileBaseName, options = {}) {
  const settings = {
    removeConstructors: true,
    removeGetters: true,
    removeSetters: true,
    ...options
  };

  const withoutPackageAndImports = source
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      return !trimmed.startsWith("package ") && !trimmed.startsWith("import ");
    })
    .join("\n");

  const masked = maskCommentsAndStrings(withoutPackageAndImports);
  const removals = findRemovableMembers(withoutPackageAndImports, masked, fileBaseName, settings);
  const code = applyRemovals(withoutPackageAndImports, removals.ranges);

  return {
    code: compactBlankLines(code).trim(),
    removed: {
      packages: source.split(/\r?\n/).filter((line) => line.trim().startsWith("package ")).length,
      imports: source.split(/\r?\n/).filter((line) => line.trim().startsWith("import ")).length,
      constructors: removals.constructors,
      getters: removals.getters,
      setters: removals.setters
    }
  };
}

function findRemovableMembers(source, masked, className, settings) {
  const ranges = [];
  let constructors = 0;
  let getters = 0;
  let setters = 0;

  for (let index = 0; index < masked.length; index += 1) {
    if (masked[index] !== "{") continue;

    const signatureStart = findSignatureStart(masked, index);
    if (signatureStart < 0) continue;

    const signature = source.slice(signatureStart, index).trim();
    if (!looksLikeMethodSignature(signature)) continue;

    const close = findMatchingBrace(masked, index);
    if (close < 0) continue;

    const methodName = extractMethodName(signature);
    const body = source.slice(index + 1, close).trim();
    const parameters = extractParameters(signature);
    const returnType = extractReturnType(signature, methodName);
    const removalStart = lineStart(source, signatureStart);
    const removalEnd = includeTrailingNewline(source, close + 1);

    if (methodName === className) {
      if (settings.removeConstructors) ranges.push([removalStart, removalEnd]);
      constructors += 1;
      index = close;
    } else if (isGetter(methodName, parameters, returnType, body)) {
      if (settings.removeGetters) ranges.push([removalStart, removalEnd]);
      getters += 1;
      index = close;
    } else if (isSetter(methodName, parameters, returnType, body)) {
      if (settings.removeSetters) ranges.push([removalStart, removalEnd]);
      setters += 1;
      index = close;
    }
  }

  return { ranges: mergeRanges(ranges), constructors, getters, setters };
}

function maskCommentsAndStrings(source) {
  const chars = Array.from(source);
  let state = "code";

  for (let index = 0; index < chars.length; index += 1) {
    const current = chars[index];
    const next = chars[index + 1];

    if (state === "code") {
      if (current === "/" && next === "/") {
        chars[index] = " ";
        state = "lineComment";
      } else if (current === "/" && next === "*") {
        chars[index] = " ";
        chars[index + 1] = " ";
        index += 1;
        state = "blockComment";
      } else if (current === "\"") {
        chars[index] = " ";
        state = "string";
      } else if (current === "'") {
        chars[index] = " ";
        state = "char";
      }
    } else if (state === "lineComment") {
      if (current === "\n") {
        state = "code";
      } else {
        chars[index] = " ";
      }
    } else if (state === "blockComment") {
      chars[index] = " ";
      if (current === "*" && next === "/") {
        chars[index + 1] = " ";
        index += 1;
        state = "code";
      }
    } else if (state === "string") {
      chars[index] = " ";
      if (current === "\\" && next) {
        chars[index + 1] = " ";
        index += 1;
      } else if (current === "\"") {
        state = "code";
      }
    } else if (state === "char") {
      chars[index] = " ";
      if (current === "\\" && next) {
        chars[index + 1] = " ";
        index += 1;
      } else if (current === "'") {
        state = "code";
      }
    }
  }

  return chars.join("");
}

function findSignatureStart(masked, braceIndex) {
  let index = braceIndex - 1;
  while (index >= 0 && /\s/.test(masked[index])) index -= 1;
  if (index < 0 || masked[index] !== ")") return -1;

  while (index >= 0) {
    const char = masked[index];
    if (char === ";" || char === "}" || char === "{") return skipWhitespace(masked, index + 1);
    index -= 1;
  }

  return skipWhitespace(masked, 0);
}

function skipWhitespace(source, start) {
  let index = start;
  while (index < source.length && /\s/.test(source[index])) index += 1;
  return index;
}

function findMatchingBrace(masked, openIndex) {
  let depth = 0;
  for (let index = openIndex; index < masked.length; index += 1) {
    if (masked[index] === "{") depth += 1;
    if (masked[index] === "}") depth -= 1;
    if (depth === 0) return index;
  }

  return -1;
}

function looksLikeMethodSignature(signature) {
  const normalized = signature.replace(/\s+/g, " ");
  if (!normalized.includes("(") || !normalized.includes(")")) return false;
  if (/\b(if|for|while|switch|catch|try|synchronized|do|else|new)\b/.test(normalized)) return false;
  return /[\w>\]\)]\s+\w+\s*\([^)]*\)$|^\s*(public|protected|private)?\s*\w+\s*\([^)]*\)$/.test(normalized);
}

function extractMethodName(signature) {
  const beforeParams = signature.slice(0, signature.lastIndexOf("(")).trim();
  const match = beforeParams.match(/([A-Za-z_$][\w$]*)\s*$/);
  return match?.[1] || "";
}

function extractParameters(signature) {
  const start = signature.lastIndexOf("(");
  const end = signature.lastIndexOf(")");
  const raw = signature.slice(start + 1, end).trim();
  if (!raw) return [];
  return raw.split(",").map((parameter) => parameter.trim()).filter(Boolean);
}

function extractReturnType(signature, methodName) {
  const beforeName = signature.slice(0, signature.lastIndexOf(methodName)).trim();
  const pieces = beforeName.split(/\s+/).filter(Boolean);
  const modifiers = new Set(["public", "protected", "private", "static", "final", "abstract", "synchronized", "native", "strictfp"]);
  const meaningful = pieces.filter((piece) => !modifiers.has(piece) && !piece.startsWith("@"));
  return meaningful.at(-1) || "";
}

function isGetter(methodName, parameters, returnType, body) {
  if (parameters.length !== 0 || returnType === "void") return false;
  if (!/^get[A-Z_$]|^is[A-Z_$]/.test(methodName)) return false;
  return /^return\s+(this\.)?[A-Za-z_$][\w$]*\s*;$/.test(body.replace(/\s+/g, " "));
}

function isSetter(methodName, parameters, returnType, body) {
  if (parameters.length !== 1 || !/^set[A-Z_$]/.test(methodName)) return false;
  if (returnType && returnType !== "void" && returnType !== "this") return false;

  const normalized = body.replace(/\s+/g, " ");
  return /^(this\.)?[A-Za-z_$][\w$]*\s*=\s*[A-Za-z_$][\w$]*\s*;(\s*return\s+this\s*;)?$/.test(normalized);
}

function lineStart(source, start) {
  let index = start;
  while (index > 0 && source[index - 1] !== "\n") index -= 1;
  return index;
}

function includeTrailingNewline(source, end) {
  let index = end;
  while (index < source.length && source[index] !== "\n") index += 1;
  return Math.min(index + 1, source.length);
}

function mergeRanges(ranges) {
  return ranges
    .sort((left, right) => left[0] - right[0])
    .reduce((merged, range) => {
      const previous = merged.at(-1);
      if (!previous || range[0] > previous[1]) {
        merged.push(range);
      } else {
        previous[1] = Math.max(previous[1], range[1]);
      }
      return merged;
    }, []);
}

function applyRemovals(source, ranges) {
  let result = "";
  let cursor = 0;

  for (const [start, end] of ranges) {
    result += source.slice(cursor, start);
    cursor = end;
  }

  return result + source.slice(cursor);
}

function compactBlankLines(source) {
  return source.replace(/\n{3,}/g, "\n\n");
}
