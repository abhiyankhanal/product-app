import React, { useState } from "react";
import { IProductType, createProduct, uploadImage } from "../data/apicalls";
import { UseMutationResult, useMutation, useQueryClient } from "react-query";

interface IProductFormProps {
  cancelForm: () => void;
}

const ProductForm = ({ cancelForm }: IProductFormProps): JSX.Element => {
  const queryClient = useQueryClient();
  const [product, setProduct] = useState<IProductType>({
    productId: "",
    productName: "",
    description: "",
    imageUri: "",
  });
  // const mutationUpload = useUploadImage(product.productId.toString(), product.imageUri);
  // const mutationCreate = useCreateProduct(product);
  const uploadImageMutation: UseMutationResult<void, Error, string, string> =
    useMutation({
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    uploadImageMutation.mutate(
      product.productId,
      product.imageUri
    );

    createProductMutation.mutate(product);
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
              setProduct({ ...product, productId: event.target.value })
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
              setProduct({ ...product, productName: event.target.value })
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
              setProduct({ ...product, description: event.target.value })
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
