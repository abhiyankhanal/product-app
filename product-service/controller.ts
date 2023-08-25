import AWS from 'aws-sdk';
import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandInput,
    GetObjectCommand,
    GetObjectCommandOutput,
    GetObjectCommandInput,
} from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import sharp from 'sharp';
import { Readable } from 'stream';

export const createProduct = async (
    event: APIGatewayProxyEvent,
    dynamoDB: AWS.DynamoDB.DocumentClient,
): Promise<APIGatewayProxyResult> => {
    try {
        const requestBody = JSON.parse(event.body || '');
        // Save product data to DynamoDB
        await dynamoDB
            .put({
                TableName: process.env?.PRODUCT_TABLE ?? 'ProductTable',
                Item: {
                    ProductId: requestBody?.productId ?? '',
                    ProductName: requestBody.productName ?? '',
                    ProductDescription: requestBody.productDescription ?? '',
                    ProductImageUri: requestBody.productImageUri ?? '',
                },
            })
            .promise();

        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: 'Product created successfully' }),
        };
        return createResponseWithCorsHeaders(response);
    } catch (error) {
        console.error('Error creating product:', error);
        const response = {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error creating product' }),
        };
        return createResponseWithCorsHeaders(response);
    }
};

export const getAllProducts = async (dynamoDB: AWS.DynamoDB.DocumentClient): Promise<APIGatewayProxyResult> => {
    try {
        // Retrieve all products from DynamoDB
        const result = await dynamoDB
            .scan({
                TableName: process.env?.PRODUCT_TABLE ?? 'ProductTable',
            })
            .promise();

        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
        return createResponseWithCorsHeaders(response);
    } catch (error) {
        console.error('Error retrieving products:', error);
        const response = {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error retrieving products' }),
        };
        return createResponseWithCorsHeaders(response);
    }
};

export const deleteProduct = async (
    event: APIGatewayProxyEvent,
    dynamoDB: AWS.DynamoDB.DocumentClient,
): Promise<APIGatewayProxyResult> => {
    try {
        const _productId = event.pathParameters?.productId;

        // Delete product from DynamoDB
        await dynamoDB
            .delete({
                TableName: process.env?.PRODUCT_TABLE ?? 'ProductTable',
                Key: { ProductId: _productId },
            })
            .promise();

        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: 'Product deleted successfully' }),
        };
        return createResponseWithCorsHeaders(response);
    } catch (error) {
        console.error('Error deleting product:', error);
        const response = {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error deleting product' }),
        };
        return createResponseWithCorsHeaders(response);
    }
};

export const uploadProductImage = async (
    event: APIGatewayProxyEvent,
    s3: S3Client,
    dynamoDB: AWS.DynamoDB.DocumentClient,
): Promise<APIGatewayProxyResult> => {
    try {
        const requestBody = JSON.parse(event.body || '');
        const image = requestBody.image;
        const productId = requestBody.productId;

        const key = `${new Date().getTime()}.jpg`;
        const bucketName = process.env?.SOURCE_BUCKET_NAME ?? '20230820-product-image-bucket';

        // Remove the prefix 'data:image/jpeg;base64,' from the base64 string and convert to buffer
        const buffer = Buffer.from(image.replace(/^data:image\/jpeg;base64,/, ''), 'base64');

        const uploadParams: PutObjectCommandInput = {
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: 'image/jpeg',
        };

        // Form the URL of the uploaded image
        const productImageUri = `https://${
            process.env.DESTINATION_BUCKET ?? '20230820-product-optimized-image-bucket'
        }.s3.amazonaws.com/resized-${uploadParams.Key}`;

        const command = new PutObjectCommand(uploadParams);

        await s3.send(command);
        console.info(`succesfully uploaded original image to s3`);

        const params = {
            TableName: process.env?.PRODUCT_TABLE ?? 'ProductTable',
            Key: { ProductId: productId },
            ExpressionAttributeNames: {
                '#Product_image_url': 'ProductImageUri',
            },
            ExpressionAttributeValues: {
                ':ProductImageUri': productImageUri,
            },
            UpdateExpression: 'SET #Product_image_url = :ProductImageUri',
            ReturnValues: 'ALL_NEW',
        };

        try {
            await dynamoDB.update(params).promise();
            console.info(`updated data to dynamo db`);

            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Product image uploaded successfully',
                    imageUrl: productImageUri,
                }),
            };
            return createResponseWithCorsHeaders(response);
        } catch (err) {
            console.error(err);

            const response = {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Error updating DynamoDB',
                    error: err,
                }),
            };
            return createResponseWithCorsHeaders(response);
        }
    } catch (error) {
        console.error('Error while uploading original image:', error);
        const response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error:',
                error: error,
            }),
        };
        return createResponseWithCorsHeaders(response);
    }
};

export const createThumbnail = async (
    source: { bucket: string; key: string },
    destination: { bucket: string; key: string },
    client: S3Client,
) => {
    console.info(`Generating thumbnail`);

    let content_buffer;
    let output_buffer;
    try {
        const objectData = await getObjectFromS3({ bucket: source.bucket, key: source.key }, client);

        const stream = objectData?.Body;
        if (stream instanceof Readable) {
            const data = [];
            for await (const chunk of stream) {
                data.push(chunk);
            }
            content_buffer = Buffer.concat(data);
        } else {
            throw new Error('Unknown object stream type');
        }
    } catch (error) {
        console.error(error);
        return;
    }

    //thumbnail width and height
    const width = 200;
    const height = 200;

    try {
        output_buffer = await sharp(content_buffer).resize(width, height).toBuffer();
        console.info('resizing....');
    } catch (error) {
        console.error(error);
        return;
    }

    try {
        await putObjectToS3({ bucket: destination.bucket, key: destination.key }, output_buffer, client);
    } catch (error) {
        console.error(error);
        return;
    }

    console.info(
        'Successfully resized ' +
            source.bucket +
            '/' +
            source.key +
            ' and uploaded to ' +
            destination.bucket +
            '/' +
            destination.key,
    );
};

// utilities functions
const getObjectFromS3 = async (
    source: { bucket: string; key: string },
    client: S3Client,
): Promise<GetObjectCommandOutput | undefined> => {
    const params: GetObjectCommandInput = {
        Bucket: source.bucket,
        Key: source.key,
        ResponseContentType: 'image/jpeg',
    };
    let data: GetObjectCommandOutput | undefined;
    try {
        data = await client.send(new GetObjectCommand(params));
    } catch (err) {
        console.error('Error', err);
    }
    return data;
};

const putObjectToS3 = async (destination: { bucket: string; key: string }, streamData: any, client: S3Client) => {
    const destparams: PutObjectCommandInput = {
        Bucket: destination.bucket,
        Key: destination.key,
        Body: streamData,
        ContentType: 'image/jpeg',
    };

    try {
        await client.send(new PutObjectCommand(destparams));
    } catch (err) {
        console.error('Error', err);
    }
};

export const createResponseWithCorsHeaders = (response: APIGatewayProxyResult): Promise<APIGatewayProxyResult> => {
    return Promise.resolve({
        ...response,
        headers: {
            ...response.headers,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        },
    });
};
