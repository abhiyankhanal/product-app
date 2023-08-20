import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
// import { Buffer } from 'buffer';
// import sharp from 'sharp';
// import { Readable } from 'stream';

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
        const bucketName = process.env?.BucketName ?? '20230820-product-image-bucket';
        // Remove the prefix 'data:image/jpeg;base64,' from the base64 string and convert to buffer
        const buffer = Buffer.from(image.replace(/^data:image\/jpeg;base64,/, ''), 'base64');

        // Define the S3 upload parameters
        const uploadParams: PutObjectCommandInput = {
            Bucket: bucketName,
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

// export const createThumbnail = async (bucket: string, key: string, s3: S3Client): Promise<Buffer> => {
//     // Set your thumbnail preferences here
//     const width = 200;
//     const height = 200;

//     try {
//         // Fetch image from S3 and convert to buffer
//         const command = new GetObjectCommand({ Bucket: bucket, Key: key });
//         const response = await s3.send(command);
//         const imageBuffer = await getStream(response.Body as Readable); // assuming it is a Node.js readable stream

//         // Resize image
//         const outputBuffer = await sharp(imageBuffer).resize(width, height).jpeg().toBuffer();

//         return outputBuffer;
//     } catch (error) {
//         console.error('Error creating thumbnail:', error);
//         throw error;
//     }
// };

// function getStream(stream: Readable): Promise<Buffer> {
//     return new Promise((resolve, reject) => {
//         const chunks: Uint8Array[] = [];
//         stream
//             .on('data', (chunk) => chunks.push(chunk))
//             .on('error', reject)
//             .on('end', () => resolve(Buffer.concat(chunks)));
//     });
// }

// export const uploadOptimizedProductImage = async (
//     s3: S3Client,
//     uploadParams: { Bucket: string; Key: string },
// ): Promise<APIGatewayProxyResult> => {
//     try {
//         // Generate and upload the thumbnail
//         const thumbnail = await createThumbnail(uploadParams.Bucket, uploadParams.Key, s3);
//         const thumbnailKey = `thumbnail/${new Date().getTime()}.jpg`;
//         const thumbnailUploadParams = {
//             Bucket: process.env?.BucketName ?? '20230820-product-image-bucket',
//             Key: thumbnailKey,
//             Body: thumbnail,
//             ContentType: 'image/jpeg',
//         };
//         const thumbnailCommand = new PutObjectCommand(thumbnailUploadParams);
//         await s3.send(thumbnailCommand);
//         return {
//             statusCode: 200,
//             body: JSON.stringify({ message: 'Thumbnail creation success' }),
//         };
//     } catch (error) {
//         console.error('Error uploading product image:', error);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ message: 'Error uploading product image' }),
//         };
//     }
// };
