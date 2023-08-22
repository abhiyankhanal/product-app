import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandInput,
    GetObjectCommand,
    GetObjectCommandOutput,
    GetObjectCommandInput,
} from '@aws-sdk/client-s3';
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
                    ProductId: requestBody?.productId ?? '0',
                    ProductName: requestBody.productName ?? '',
                    ProductDescription: requestBody.productDescription ?? '',
                    ProductImageUri: requestBody.productImageUri ?? '',
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
        const _productId = event.pathParameters?.productId;

        // Delete product from DynamoDB
        await dynamoDB
            .delete({
                TableName: process.env?.ProductTable ?? 'ProductTable',
                Key: { ProductId: _productId },
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
        const productId = requestBody.productId;

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
        const productImageUri = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;

        const command = new PutObjectCommand(uploadParams);

        await s3.send(command);
        console.log('send to s3 success');

        const params = {
            TableName: process.env?.ProductTable ?? 'ProductTable',
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
            const data = await dynamoDB.update(params).promise();
            console.log(data);

            console.info('Image uploaded successfully!');

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Product image uploaded successfully',
                    imageUrl: productImageUri,
                }),
            };
        } catch (err) {
            console.error(err);

            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Error updating DynamoDB',
                    error: err,
                }),
            };
        }
    } catch (error) {
        console.error('Error sending to S3:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error sending to S3',
                error: error,
            }),
        };
    }
};

// export const createThumbnail = async (
//     source: { bucket: string; key: string },
//     destination: { bucket: string; key: string },
//     client: S3Client,
// ) => {
//     console.log('inside thumbnail creator');
//     try {
//         const params = {
//             Bucket: source.bucket,
//             Key: source.key,
//         };
//         console.log(`bucket: ${source.bucket} key: ${source.key}`);
//         const response: GetObjectCommandOutput = await client.send(new GetObjectCommand(params));
//         console.log('got image');
//         const streamData = response.Body;

//         if (!(streamData instanceof Readable)) {
//             throw new Error('Unknown object stream type');
//         }

//         const convert = spawn('convert', [
//             '-', // input from stdin
//             '-thumbnail',
//             '200x200^', // thumbnail via imagemagick
//             '-', // output to stdout
//         ]);
//         console.log('converted');

//         const outStreamToBuffer = new Promise<Buffer>((resolve) => {
//             const chunks: Buffer[] = [];
//             convert.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
//             convert.stdout.on('end', () => resolve(Buffer.concat(chunks)));
//         });
//         console.log('stream to buffer done');

//         // Pipe the image file data from the S3 get request into ImageMagick
//         streamData.pipe(convert.stdin);
//         console.log('stream pipe');

//         const output_buffer = await outStreamToBuffer;
//         console.log('output');

//         const destparams = {
//             Bucket: destination.bucket,
//             Key: destination.key,
//             Body: streamData,
//             ContentType: 'image/jpeg',
//         };
//         console.log('dest param');

//         await client.send(new PutObjectCommand(destparams));
//         console.log('sent');

//         console.info(
//             'Successfully resized ' +
//                 source.bucket +
//                 '/' +
//                 source.key +
//                 ' and uploaded to ' +
//                 destination.bucket +
//                 '/' +
//                 destination.bucket,
//         );
//     } catch (error) {
//         console.log(error);
//         return;
//     }
// };

export const createThumbnail = async (
    source: { bucket: string; key: string },
    destination: { bucket: string; key: string },
    client: S3Client,
) => {
    console.log('inside thumbnail creator');

    let content_buffer;
    let output_buffer;
    try {
        const objectData = await getObjectFromS3({ bucket: source.bucket, key: source.key }, client);
        console.log('got image');

        const stream = objectData?.Body;
        if (stream instanceof Readable) {
            const data = [];
            for await (const chunk of stream) {
                data.push(chunk);
                console.log('pushing data..')
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
        console.log('sharping..')
    } catch (error) {
        console.error(error);
        return;
    }

    try {
        await putObjectToS3({ bucket: destination.bucket, key: destination.key }, output_buffer, client);
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
            destination.key,
    );
};

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
        console.log('Error', err);
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
    console.log('dest param');
    try {
        await client.send(new PutObjectCommand(destparams));
    } catch (err) {
        console.log('Error', err);
    }
    console.log('sent');
};
