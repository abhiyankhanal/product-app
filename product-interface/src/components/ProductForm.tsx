import React, { useState } from "react";
import {
  ICreateProductType,
  IProductType,
  IUploadImageInterface,
  createProduct,
  uploadImage,
} from "../data/apicalls";
import { UseMutationResult, useMutation, useQueryClient } from "react-query";
import { ErrorModal, Loading } from "./UtilsUI";

interface IProductFormProps {
  cancelForm: () => void;
}

const ProductForm = ({ cancelForm }: IProductFormProps): JSX.Element => {
  const apiKey = localStorage.getItem('X-Api-Key');
  console.log(`API key here`, apiKey)
  const queryClient = useQueryClient();
  const [product, setProduct] = useState<IProductType>({
    ProductId: "",
    ProductName: "",
    ProductDescription: "",
    ProductImageUri: "",
  });

  const [uploadData, setUploadData] = useState<IUploadImageInterface>({
    productId: "",
    image: "",
    apiKey: apiKey!
  });

  const uploadImageMutation: UseMutationResult<
    void,
    Error,
    IUploadImageInterface
  > = useMutation({
    mutationFn: uploadImage,
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries(["products"]);
      }, 10000);
    },
  });

  const createProductMutation: UseMutationResult<void, Error, ICreateProductType, string> =
    useMutation({
      mutationFn: createProduct,
      onSuccess: () => {
        queryClient.invalidateQueries(["products"]);
      },
    });

  createProductMutation.isLoading && <Loading />
  createProductMutation.isError &&
    <ErrorModal
      error={createProductMutation.error}
      onClose={() => createProductMutation.reset()}
    ></ErrorModal>;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    uploadImageMutation.mutate({
      image: uploadData.image,
      productId: product.ProductId,
      apiKey: apiKey!
    });
    createProductMutation.mutate({...product, apiKey});
    cancelForm();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          const base64Image = e.target.result;
          setUploadData((uploadData) => ({
            ...uploadData,
            image: String(base64Image)
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-bold" htmlFor="productId">
            Product ID
          </label>
          <input
            className="w-full p-2 border rounded"
            type="text"
            id="productId"
            name="productId"
            required
            onChange={(event) =>
              setProduct({ ...product, ProductId: event.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-bold" htmlFor="productName">
            Product Name
          </label>
          <input
            className="w-full p-2 border rounded"
            type="text"
            id="productName"
            name="productName"
            required
            onChange={(event) =>
              setProduct({ ...product, ProductName: event.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-bold" htmlFor="description">
            Description
          </label>
          <textarea
            className="w-full p-2 border rounded"
            id="description"
            name="description"
            rows={3}
            required
            onChange={(event) =>
              setProduct({ ...product, ProductDescription: event.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-bold" htmlFor="productImage">
            Upload Image
          </label>
          <input
            className="w-full p-2 border rounded"
            type="file"
            id="productImage"
            name="productImage"
            accept=".jpg, .jpeg"
            required
            onChange={handleImageChange}
          />
        </div>

        <button className="py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700 mr-2" disabled={uploadImageMutation.isLoading}>
          Submit
        </button>
        <button
          className="py-2 px-4 bg-gray-200 text-black rounded hover:bg-gray-400"
          type="button"
          onClick={cancelForm}
        >
          Cancel
        </button>
      </form>
    </>
  );
};

export default ProductForm;
