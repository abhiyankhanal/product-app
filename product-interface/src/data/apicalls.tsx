import Axios from "axios";
export interface IProductType {
  ProductId: string;
  ProductName: string;
  ProductDescription: string;
  ProductImageUri: string|null;
}


let dummyProducts: IProductType[] = [
  {
    ProductId: "1",
    ProductName: "Hello Plerion",
    ProductDescription: "Dummy Product Rendered from react",
    ProductImageUri: "",
  },
];

// const BASE_URI = `http://127.0.0.1:3000`; //local
const BASE_URI = `https://9a94xfutb7.execute-api.us-east-1.amazonaws.com/Prod`; //prod

export const fetchProduct = async (): Promise<IProductType[]> => {
  const res = await Axios.get(`${BASE_URI}/products`);
  return res.data;
};

export const deleteProduct = async (productId: string): Promise<any> => {
  const res = await Axios.delete(`${BASE_URI}/product/${productId}`);
  return res.data;
};

export const createProduct = async (product: IProductType): Promise<any> => {
  const requestBody = {
    productId: product.ProductId,
    productName: product.ProductName,
    productDescription: product.ProductDescription,
    productImageUri: product.ProductImageUri,
  };
  const res = await Axios.post(`${BASE_URI}/product`, requestBody);
  return res.data;
};

export interface IUploadImageInterface{
  productId: string
  image: string
}
export const uploadImage = async (
 imageData: IUploadImageInterface
): Promise<any> => {
  const requestBody: IUploadImageInterface = {
    productId: imageData.productId,
    image: imageData.image,
  };
  console.log(requestBody)
  const res = await Axios.post(`${BASE_URI}/product/upload`, requestBody);
  return res.data;
};

export default dummyProducts;
