import AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createProduct, deleteProduct, getAllProducts } from './controller';
import dynamodb from 'aws-sdk/clients/dynamodb';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
console.log('init');
const dynamoDB = process.env?.AWS_SAM_LOCAL
    ? new dynamodb.DocumentClient({
          endpoint: 'http://host.docker.internal:8000',
      })
    : new dynamodb.DocumentClient();
// const s3: AWS.S3 = new AWS.S3();

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('handler called');
    let response: Promise<APIGatewayProxyResult>;

    if (event.httpMethod === 'POST' && event.path === '/product') {
        console.log('inside product');
        response = createProduct(event, dynamoDB);
        return response;
    } else if (event.httpMethod === 'GET' && event.path === '/products') {
        console.log('inside products');
        response = getAllProducts(dynamoDB);
        return response;
    } else if (event.httpMethod === 'DELETE' && event.path.startsWith('/product/')) {
        console.log('inside edit');
        const productId = event.pathParameters?.productId;
        if (productId) {
            response = deleteProduct(event, dynamoDB);
            return response;
        }
    }
    return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Path not found' }),
    };
};
