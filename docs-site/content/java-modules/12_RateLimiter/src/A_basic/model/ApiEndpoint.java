package A_basic.model;

import A_basic.model.enums.HttpMethod;

public class ApiEndpoint {
    private final String apiEndpointId;
    private final String path;
    private final HttpMethod httpMethod;

    public ApiEndpoint(String apiEndpointId, String path, HttpMethod httpMethod) {
        this.apiEndpointId = apiEndpointId;
        this.path = path;
        this.httpMethod = httpMethod;
    }

    public String getApiEndpointId() {
        return apiEndpointId;
    }

    public String getPath() {
        return path;
    }

    public HttpMethod getHttpMethod() {
        return httpMethod;
    }

    @Override
    public String toString() {
        return "ApiEndpoint{"
                + "apiEndpointId='" + apiEndpointId + '\''
                + ", path='" + path + '\''
                + ", httpMethod=" + httpMethod
                + '}';
    }
}
