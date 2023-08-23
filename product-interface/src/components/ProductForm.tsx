import React, { useState } from "react";
import {
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
  });

  const uploadImageMutation: UseMutationResult<
    void,
    Error,
    IUploadImageInterface
  > = useMutation({
    mutationFn: uploadImage,
    onSuccess: () => {
      setTimeout(() => {
        // Invalidate the "products" query after waiting for 10 seconds
        queryClient.invalidateQueries("products");
      }, 10000);
    },
  });

  const createProductMutation: UseMutationResult<void, Error, IProductType> =
    useMutation({
      mutationFn: createProduct,
      onSuccess: () => {
        queryClient.invalidateQueries("products");
      },
    });
  if(createProductMutation.isLoading || uploadImageMutation.isLoading) {return <Loading />}
  if (createProductMutation.isError || uploadImageMutation.isError) {
    <ErrorModal
      error={createProductMutation.error ?? uploadImageMutation.error!}
      onClose={() => createProductMutation.reset()}
    ></ErrorModal>;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    uploadImageMutation.mutate({
      image: uploadData.image,
      productId: uploadData.productId,
    });

    createProductMutation.mutate(product);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Convert the selected image to a base64 string
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          const base64Image = e.target.result;
          setUploadData((uploadData) => ({
            ...uploadData,
            uploadData: base64Image?.toString(),
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

        <button className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2">
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
