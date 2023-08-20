import { APIGatewayProxyResult } from 'aws-lambda';
import { createProduct, deleteProduct, getAllProducts, uploadProductImage } from './controller';
import dynamodb from 'aws-sdk/clients/dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
const dynamoDB = process.env?.AWS_SAM_LOCAL
    ? new dynamodb.DocumentClient({
          endpoint: 'http://host.docker.internal:8000',
      })
    : new dynamodb.DocumentClient();

const s3 = new S3Client({ region: 'us-east-1' });

export const lambdaHandler = async (event: any): Promise<APIGatewayProxyResult> => {
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
    } else if (event.httpMethod === 'POST' && event.path === '/product/upload') {
        response = uploadProductImage(event, s3);
        return response;
    } else if (event.source === 'aws.s3') {
        console.log(`Triggered by event`);
        // const bucket = event.Records[0].s3.bucket.name;
        // const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
        // response = uploadOptimizedProductImage(s3, { Bucket: bucket, Key: key });
        return Promise.resolve({
            statusCode: 400,
            body: JSON.stringify({ message: 'Path not found' }),
        });
    }
    return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Path not found' }),
    };
};
