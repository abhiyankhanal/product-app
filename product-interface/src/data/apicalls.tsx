import { useMutation, useQuery, UseMutationResult, UseQueryResult } from 'react-query';
export interface IProductType{
    productId: number;
    productName: string
    description: string;
    imageUri: any;
}

interface ImageUploadData{
    id: string;
    image: string;
  }

let dummyProducts: IProductType[] = [
  {
    productId: 1,
    productName: "Hello Plerion",
    description: "Dummy Product Rendered from react",
    imageUri: "",
  },
];
  
  export const useFetchProduct = (): UseQueryResult<IProductType[], Error> => {
    return useQuery<IProductType[], Error>('products', () =>
      fetch("https://9a94xfutb7.execute-api.us-east-1.amazonaws.com/Prod/products")
        .then(res => res.json())
    );
  }
  
  export const useDeleteHandler = () => {
    return (productId: number) =>
      fetch(
        `https://9a94xfutb7.execute-api.us-east-1.amazonaws.com/Prod/products/${productId}`,
        { method: "DELETE" }
      )
      .then(res => res.json());
  };
  
  export const useCreateProduct = (product: IProductType): UseMutationResult<void, Error, void, unknown> => {
    return useMutation<void, Error, void, unknown>(() =>
      fetch("http://127.0.0.1:3000/product", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      })
        .then(res => res.json())
    );
  };
  
  export const useUploadImage = (id: string, imageBase64: string): UseMutationResult<void, Error, ImageUploadData, unknown> => {
    const data: ImageUploadData = {
      id,
      image: imageBase64,
    };
  
    return useMutation<void, Error, ImageUploadData, unknown>(() =>
      fetch("https://xb156ryw68.execute-api.us-east-1.amazonaws.com/Stage/product/upload", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
    );
  };


export default dummyProducts;
