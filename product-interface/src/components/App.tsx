import React, { useState } from "react";
import ReactModal from "react-modal";
import { AiFillDelete } from "react-icons/ai";
import { AiFillPlusCircle } from "react-icons/ai";
import ProductForm from "./ProductForm";

// Dummy data
const products = [
  {
    productId: 1,
    productName: "Product 1",
    description: "helo hello hell ohehef fjeklhfjhf jkfh dkj f",
    imageUrl: "https://via.placeholder.com/150", // Placeholder image
  },
  {
    productId: 2,
    productName: "Product 2",
    description: "helo hello hell ohehef fjeklhfjhf jkfh dkj f",
    imageUrl:
      "https://s3.amazonaws.com/images.seroundtable.com/google-bold-1541767414.jpg", // Placeholder image
  },
  {
    productId: 1,
    productName: "Product 1",
    description: "helo hello hell ohehef fjeklhfjhf jkfh dkj f",
    imageUrl: "https://via.placeholder.com/150", // Placeholder image
  },
  {
    productId: 2,
    productName: "Product 2",
    description: "helo hello hell ohehef fjeklhfjhf jkfh dkj f",
    imageUrl:
      "https://s3.amazonaws.com/images.seroundtable.com/google-bold-1541767414.jpg", // Placeholder image
  },
  {
    productId: 1,
    productName: "Product 1",
    description: "helo hello hell ohehef fjeklhfjhf jkfh dkj f",
    imageUrl: "https://via.placeholder.com/150", // Placeholder image
  },
];

const ProductList = (): JSX.Element => {
  const [showForm, setShowForm] = useState(false);
  ReactModal.setAppElement("#root");
  return (
    <>
      <div className="flex flex-col items-center justify-center mt-4">
        <h2 className="text-3xl font-bold mb-4 text-center mx-2">Products</h2>
        {products.map((product) => (
          <div
            key={product.productId}
            className="bg-white shadow overflow-hidden sm:rounded-md mb-4 flex items-center justify-between px-4 py-2 mx-2"
          >
            <img
              className="w-16 h-16 flex-1 mx-2"
              src={product.imageUrl}
              alt={product.productName}
            />
            <p className="text-l flex-1 mx-2">{product.productName}</p>
            <p className="text-l flex-1 mx-2">{product.description}</p>
            <button className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-700 flex items-center justify-center flex-1">
              <AiFillDelete className="mr-1" />
              Delete
            </button>
          </div>
        ))}

        <ReactModal
          isOpen={showForm}
          onRequestClose={() => setShowForm(false)}
          style={{
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
            },
          }}
        >
          <ProductForm cancelForm={() => setShowForm(false)} />
        </ReactModal>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 fixed right-4 bottom-4 p-6 rounded-full hover:bg-blue-700"
        >
          <AiFillPlusCircle className="text-2xl text-white" />
        </button>
      </div>
    </>
  );
};

export default ProductList;
