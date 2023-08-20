import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

export const createProduct = async (
    event: APIGatewayProxyEvent,
    dynamoDB: AWS.DynamoDB.DocumentClient,
): Promise<APIGatewayProxyResult> => {
    try {
        const requestBody = JSON.parse(event.body || '');

        // Validate and sanitize requestBody here

        // Save product data to DynamoDB
        await dynamoDB
            .put({
                TableName: process.env?.ProductTable ?? 'ProductTable',
                Item: {
                    ProductId: requestBody.productId,
                    ProductName: requestBody.productName,
                    ProductImageUri: requestBody.productImageUri,
                },
            })
            .promise();

        // Asynchronously generate and store product thumbnail in S3
        // Implement thumbnail generation logic here

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Product created successfully' }),
        };
    } catch (error) {
        console.error('Error creating product:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error creating product' }),
        };
    }
};

export const getAllProducts = async (dynamoDB: AWS.DynamoDB.DocumentClient): Promise<APIGatewayProxyResult> => {
    try {
        // Retrieve all products from DynamoDB
        const result = await dynamoDB
            .scan({
                TableName: process.env?.ProductTable ?? 'ProductTable',
            })
            .promise();

        return {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
    } catch (error) {
        console.error('Error retrieving products:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error retrieving products' }),
        };
    }
};

export const deleteProduct = async (
    event: APIGatewayProxyEvent,
    dynamoDB: AWS.DynamoDB.DocumentClient,
): Promise<APIGatewayProxyResult> => {
    try {
        const productId = event.pathParameters?.productId;

        // Delete product from DynamoDB
        await dynamoDB
            .delete({
                TableName: process.env?.ProductTable ?? 'ProductTable',
                Key: { ProductId: productId },
            })
            .promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Product deleted successfully' }),
        };
    } catch (error) {
        console.error('Error deleting product:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error deleting product' }),
        };
    }
};

export const uploadProductImage = async (event: APIGatewayProxyEvent, s3: S3Client): Promise<APIGatewayProxyResult> => {
    try {
        // Parse the body of the event
        const image = JSON.parse(event.body || '').image;

        // Generate a unique key for this image
        const key = `original/${new Date().getTime()}.jpg`;

        // Remove the prefix 'data:image/jpeg;base64,' from the base64 string and convert to buffer
        const buffer = Buffer.from(image.replace(/^data:image\/jpeg;base64,/, ''), 'base64');

        // Define the S3 upload parameters
        const uploadParams: PutObjectCommandInput = {
            Bucket: process.env?.BucketName ?? '20230819-product-image-bucket',
            Key: key,
            Body: buffer,
            ContentType: 'image/jpeg',
        };

        // Upload the image
        const command = new PutObjectCommand(uploadParams);
        await s3.send(command);
        console.log('Image uploaded successfully!');

        // Form the URL of the uploaded image
        const imageUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Product image uploaded successfully',
                imageUrl: imageUrl,
            }),
        };
    } catch (error) {
        console.error('Error uploading product image:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error uploading product image' }),
        };
    }
};
