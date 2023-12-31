import { S3Client } from '@aws-sdk/client-s3';
import dynamodb from 'aws-sdk/clients/dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';

import {
    createProduct,
    createResponseWithCorsHeaders,
    createThumbnail,
    deleteProduct,
    getAllProducts,
    uploadProductImage,
} from './controller';
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

const s3 = new S3Client({});

export const lambdaHandler = async (event: any): Promise<APIGatewayProxyResult> => {
    let response: Promise<APIGatewayProxyResult>;
    const notFound = {
        statusCode: 400,
        body: JSON.stringify({ message: 'The requested path is not available or not found' }),
    };

    const notFoundeResponse = createResponseWithCorsHeaders(notFound);

    //create product with empty image
    if (event.httpMethod === 'POST' && event.path === '/product') {
        response = createProduct(event, dynamoDB);
        return response;

        //Get product list
    } else if (event.httpMethod === 'GET' && event.path === '/products') {
        response = getAllProducts(dynamoDB);
        return response;

        //Delete product
    } else if (event.httpMethod === 'DELETE' && event.path.startsWith('/product/')) {
        const productId = event.pathParameters?.productId;
        if (productId) {
            response = deleteProduct(event, dynamoDB);
            return response;
        }

        //Upload original image
    } else if (event.httpMethod === 'POST' && event.path === '/product/upload') {
        response = uploadProductImage(event, s3, dynamoDB);
        return response;

        //Get event from event rule and create thumbnail
    } else if (event.source === 'aws.s3') {
        console.info(`Reading options from event:\n ${JSON.stringify(event)}`);
        const srcBucket = event.detail.bucket.name;

        const srcKey = decodeURIComponent(event.detail.object.key.replace(/\+/g, ' '));
        const dstBucket = process.env.DESTINATION_BUCKET ?? '20230820-product-optimized-image-bucket';
        const dstKey = 'resized-' + srcKey;

        // Infer the image type from the file suffix
        const typeMatch = srcKey.match(/\.([^.]*)$/);
        if (!typeMatch) {
            console.info('Could not determine the image type.');
            return notFound;
        }

        // Check that the image type is supported
        const imageType = typeMatch[1].toLowerCase();
        if (imageType != 'jpg' && imageType != 'jpeg') {
            console.info(`Unsupported image type: ${imageType}`);
            return notFound;
        }

        createThumbnail({ bucket: srcBucket, key: srcKey }, { bucket: dstBucket, key: dstKey }, s3);
    }
    return notFoundeResponse;
};
