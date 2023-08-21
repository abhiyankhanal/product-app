import React, { useState } from "react";
import { IProductType, useCreateProduct, useUploadImage } from "../data/apicalls";
import { useMutation } from "react-query";

interface IProductFormProps {
  cancelForm: () => void;
}

const ProductForm = ({ cancelForm }: IProductFormProps): JSX.Element => {
  const [product, setProduct] = useState<IProductType>({
    productId: 0,
    productName: '',
    description: '',
    imageUri: '',
  });

  const mutationUpload = useUploadImage(product.productId.toString(), product.imageUri);
  const mutationCreate = useCreateProduct(product);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Upload Image first
    mutationUpload.mutate({ id: product.productId.toString(), image: product.imageUri }, {
      onSuccess: () => {
        // On successful image upload, create the product.
        mutationCreate.mutate();
      }
    });
  };

  return(
    <>
  <form className="space-y-4" onSubmit={handleSubmit}>
    <div>
      <label className="text-sm font-bold" htmlFor="productId">
        Product ID
      </label>
      <input
        className="w-full p-2 border rounded"
        type="number"
        id="productId"
        name="productId"
        required
        onChange={event => setProduct({...product, productId: Number(event.target.value)})} 
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
        onChange={event => setProduct({...product, productName: event.target.value})} 
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
        onChange={event => setProduct({...product, description: event.target.value})} 
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
  }

export default ProductForm;
