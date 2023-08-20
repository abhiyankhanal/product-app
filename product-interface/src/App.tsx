import React from 'react';
import { AiFillDelete } from "react-icons/ai";
import { AiFillPlusCircle } from "react-icons/ai"; 

// Dummy data
const products = [
  {
    productId: 1,
    productName: 'Product 1',
    imageUrl: 'https://via.placeholder.com/150' // Placeholder image
  },
  {
    productId: 2,
    productName: 'Product 2',
    imageUrl: 'https://via.placeholder.com/150' // Placeholder image
  },
];

const ProductList = () => (
  <div className="flex flex-col items-center justify-center">
    <h2 className="text-lg font-bold mb-4 text-center">Products</h2>
    {products.map((product) => (
      <div key={product.productId} className="bg-white shadow overflow-hidden sm:rounded-md mb-4 flex items-center justify-between px-4 py-2">
        <img className="w-16 h-16 flex-1" src={product.imageUrl} alt={product.productName} />
        <p className="text-sm flex-1">{product.productId}</p>
        <p className="text-xl flex-1">{product.productName}</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center flex-1">
          <AiFillPlusCircle className="mr-1"/> 
          Add
        </button>
        <button className="ml-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center flex-1">
          <AiFillDelete className="mr-1"/> 
          Delete
        </button>
      </div>
    ))}
  </div>
);

export default ProductList;
