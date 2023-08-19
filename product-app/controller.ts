import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

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
