import Axios from "axios";
export interface IProductType {
  productId: string;
  productName: string;
  description: string;
  imageUri: any;
}


let dummyProducts: IProductType[] = [
  {
    productId: "1",
    productName: "Hello Plerion",
    description: "Dummy Product Rendered from react",
    imageUri: "",
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
    productId: product.productId,
    productName: product.productName,
    productDescription: product.description,
    productImageUri: product.imageUri,
  };
  const res = await Axios.post(`${BASE_URI}/product`, requestBody);
  return res.data;
};

interface IUploadImageInterface{
  productId: string
  image: string
}
export const uploadImage = async (
  base64ImageFile: string,
  id: string
): Promise<any> => {
  const requestBody: IUploadImageInterface = {
    productId: id,
    image: base64ImageFile,
  };
  const res = await Axios.post(`${BASE_URI}/product/upload`, requestBody);
  return res.data;
};

export default dummyProducts;
