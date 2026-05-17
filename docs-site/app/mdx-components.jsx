export function useMDXComponents(components) {
  return {
    h1: (props) => <h1 className="text-4xl font-semibold tracking-normal text-slate-950" {...props} />,
    h2: (props) => <h2 className="mt-8 text-2xl font-semibold tracking-normal text-slate-950" {...props} />,
    p: (props) => <p className="mt-3 text-base leading-8 text-slate-600" {...props} />,
    ul: (props) => <ul className="mt-4 space-y-2 pl-6 text-slate-700" {...props} />,
    li: (props) => <li className="leading-7" {...props} />,
    ...components
  };
}
