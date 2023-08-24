import Axios from "axios";
export interface IProductType {
  ProductId: string;
  ProductName: string;
  ProductDescription: string;
  ProductImageUri: string | null;
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
const BASE_URI = `https://hijplpidac.execute-api.us-east-1.amazonaws.com/Prod`; //prod

export const fetchProduct = async (apiKey: string): Promise<IProductType[]> => {
  const res = await Axios.get(`${BASE_URI}/products`, {
    headers: { 
      "X-Api-Key": apiKey,
      "Accept": "X-Api-Key, Content-Type", 
      "Content-Type": "application/json"
    },
  });
  return res.data;
};

export const deleteProduct = async (
  productId: string,
  apiKey: string
): Promise<any> => {
  const res = await Axios.delete(`${BASE_URI}/product/${productId}`, {
    headers: { 
      "X-Api-Key": apiKey,
      "Accept": "Content-Type", 
      "Content-Type": "application/json"
    },
  });
  return res.data;
};

export interface ICreateProductType extends IProductType {
  apiKey: string|null;
}
export const createProduct = async (
  createProductParams: ICreateProductType
): Promise<any> => {
  const requestBody = {
    productId: createProductParams.ProductId,
    productName: createProductParams.ProductName,
    productDescription: createProductParams.ProductDescription,
    productImageUri: createProductParams.ProductImageUri
  };
  const res = await Axios.post(`${BASE_URI}/product`, requestBody, {
    headers: { 
      "X-Api-Key": createProductParams.apiKey, 
      "Accept": "Content-Type", 
      "Content-Type": "application/json"
    },
  });
  return res.data;
};

export interface IUploadImageInterface {
  productId: string;
  image: string;
  apiKey?: string;
}
export const uploadImage = async (
  imageData: IUploadImageInterface
): Promise<any> => {
  const uploadParams: IUploadImageInterface = {
    productId: imageData.productId,
    image: imageData.image,
  };

  const res = await Axios.post(`${BASE_URI}/product/upload`, uploadParams, {
    headers: { 
      "X-Api-Key": imageData.apiKey, 
        "Accept": "Content-Type", 
        "Content-Type": "application/json"
    },
  });
  return res.data;
};

export default dummyProducts;
