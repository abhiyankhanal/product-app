import React from 'react';

interface IProductFormProps {
    cancelForm: () => void;
  }
const ProductForm = ({ cancelForm }: IProductFormProps): JSX.Element => (
  <form className="space-y-4">
    <div>
      <label className="text-sm font-bold" htmlFor="productId">Product Id</label>
      <input 
          className="w-full p-2 border rounded" 
          type="text" 
          id="productId" 
          name="productId" 
          required 
      />
    </div>
    
    <div>
      <label className="text-sm font-bold" htmlFor="description">Description</label>
      <textarea 
          className="w-full p-2 border rounded" 
          id="description"
          name="description"
          rows={3}
          required
      />
    </div>

    <div>
      <label className="text-sm font-bold" htmlFor="productImage">Upload Image</label>
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
  onClick={cancelForm}>
  Cancel
</button>
  </form>
);

export default ProductForm;