import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import { S3Client, PutObjectCommand, PutObjectCommandInput, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import sharp from 'sharp';

export const createProduct = async (
    event: APIGatewayProxyEvent,
    dynamoDB: AWS.DynamoDB.DocumentClient,
): Promise<APIGatewayProxyResult> => {
    try {
        const requestBody = JSON.parse(event.body || '');
        // Save product data to DynamoDB
        await dynamoDB
            .put({
                TableName: process.env?.ProductTable ?? 'ProductTable',
                Item: {
                    ProductId: requestBody.productId,
                    ProductName: requestBody.productName,
                    ProductImageUri: '',
                },
            })
            .promise();

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

export const uploadProductImage = async (
    event: APIGatewayProxyEvent,
    s3: S3Client,
    dynamoDB: AWS.DynamoDB.DocumentClient,
): Promise<APIGatewayProxyResult> => {
    try {
        const requestBody = JSON.parse(event.body || '');
        const image = requestBody.image;
        const _productId = requestBody.Id;

        const key = `original/${new Date().getTime()}.jpg`;
        const bucketName = process.env?.BucketName ?? '20230820-product-image-bucket';

        // Remove the prefix 'data:image/jpeg;base64,' from the base64 string and convert to buffer
        const buffer = Buffer.from(image.replace(/^data:image\/jpeg;base64,/, ''), 'base64');

        const uploadParams: PutObjectCommandInput = {
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: 'image/jpeg',
        };

        // Form the URL of the uploaded image
        const imageUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;

        const command = new PutObjectCommand(uploadParams);
        await s3.send(command).then(async () => {
            const params = {
                TableName: process.env?.ProductTable ?? 'ProductTable',
                Key: { productId: _productId },
                ExpressionAttributeNames: {
                    '#product_image_url': 'imageUrl',
                },
                ExpressionAttributeValues: {
                    ':imageUrl': imageUrl,
                },
                UpdateExpression: 'SET #product_image_url = :imageUrl',
                ReturnValues: 'ALL_NEW',
            };

            try {
                const data = await dynamoDB.update(params).promise();
                console.log(data);
            } catch (err) {
                console.error(err);
            }
        });
        console.info('Image uploaded successfully!');

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

export const createThumbnail = async (
    source: { bucket: string; key: string },
    destination: { bucket: string; key: string },
    s3: S3Client,
) => {
    // Get the image from the source bucket. GetObjectCommand returns a stream.
    let content_buffer: Buffer;
    let output_buffer: Buffer;
    try {
        const params = {
            Bucket: source.bucket,
            Key: source.key,
        };
        const response = await s3.send(new GetObjectCommand(params));
        const stream = response.Body;

        // Convert stream to buffer to pass to sharp resize function.
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

    // set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
    const width = 200;

    try {
        output_buffer = await sharp(content_buffer).resize(width).toBuffer();
    } catch (error) {
        console.error(error);
        return;
    }

    try {
        const destparams = {
            Bucket: destination.bucket,
            Key: destination.key,
            Body: output_buffer,
            ContentType: 'image',
        };

        await s3.send(new PutObjectCommand(destparams));
    } catch (error) {
        console.log(error);
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
            destination.bucket,
    );
};
