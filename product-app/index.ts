import { APIGatewayProxyResult } from 'aws-lambda';
import { createProduct, createThumbnail, deleteProduct, getAllProducts, uploadProductImage } from './controller';
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

const s3 = new S3Client({ region: process.env.Region ?? 'us-east-1' });

export const lambdaHandler = async (event: any): Promise<APIGatewayProxyResult> => {
    let response: Promise<APIGatewayProxyResult>;
    const notFound = Promise.resolve({
        statusCode: 400,
        body: JSON.stringify({ message: 'Path not found' }),
    });

    if (event.httpMethod === 'POST' && event.path === '/product') {
        response = createProduct(event, dynamoDB);
        return response;
    } else if (event.httpMethod === 'GET' && event.path === '/products') {
        response = getAllProducts(dynamoDB);
        return response;
    } else if (event.httpMethod === 'DELETE' && event.path.startsWith('/product/')) {
        const productId = event.pathParameters?.productId;
        if (productId) {
            response = deleteProduct(event, dynamoDB);
            return response;
        }
    } else if (event.httpMethod === 'POST' && event.path === '/product/upload') {
        response = uploadProductImage(event, s3, dynamoDB);
        return response;
    } else if (event.source === 'aws.s3') {
        console.info('Reading options from event:\n');
        const srcBucket = event.Records[0].s3.bucket.name;

        // Object key may have spaces or unicode non-ASCII characters
        const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
        const dstBucket = srcBucket + '-resized';
        const dstKey = 'resized-' + srcKey;

        // Infer the image type from the file suffix
        const typeMatch = srcKey.match(/\.([^.]*)$/);
        if (!typeMatch) {
            console.log('Could not determine the image type.');
            return notFound;
        }

        // Check that the image type is supported
        const imageType = typeMatch[1].toLowerCase();
        if (imageType != 'jpg' && imageType != 'png') {
            console.log(`Unsupported image type: ${imageType}`);
            return notFound;
        }

        createThumbnail({ bucket: srcBucket, key: srcKey }, { bucket: dstBucket, key: dstKey }, s3);
        return notFound;
    }
    return notFound;
};
