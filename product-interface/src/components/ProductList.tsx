import { useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import ReactModal from "react-modal";
import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import dummyProducts, {
  fetchProduct,
  IProductType,
  deleteProduct,
} from "../data/apicalls";
import ProductForm from "./ProductForm";
import { ErrorModal, Loading } from "./UtilsUI";

const PLACEHOLDER_IMG_URL = `https://via.placeholder.com/150`;

const ProductList = (): JSX.Element => {
  ReactModal.setAppElement("#root");
  const apiKey = localStorage.getItem('X-Api-Key');
  const productListQuery: UseQueryResult<IProductType[], Error> = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProduct(apiKey!),
  });

  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const deleteProductMutation: UseMutationResult<void, Error, string> =
    useMutation({
      mutationFn: (productId: string) => deleteProduct(productId, apiKey!),
      onSuccess: () => {
        queryClient.invalidateQueries(["products"]);
      },
    });

  if (deleteProductMutation.isLoading) {
    return <Loading />;
  }

  if (productListQuery.isError) {
    <ErrorModal error={productListQuery.error} onClose={() => null}></ErrorModal>;
  }

  if (deleteProductMutation.isError) {
    return (
      <ErrorModal
        error={deleteProductMutation.error}
        onClose={() => deleteProductMutation.reset()}
      ></ErrorModal>
    );
  }

  let productsForUI: IProductType[];
  productsForUI = dummyProducts;
  if (productListQuery.isLoading) {
    productsForUI = dummyProducts;
  } else if (productListQuery.data) {
    productsForUI = productListQuery.data;
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries(["products"]);
  }

  return (
    <>
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
        <ProductForm cancelForm={() => setShowForm(false)}/>
      </ReactModal>

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-gray-700 fixed right-4 bottom-4 p-6 rounded-full hover:bg-gray-800"
      >
        <AiFillPlusCircle className="text-2xl text-white" />
      </button>
      <div className="container">
        <div className="text-center mx-2 mt-5">
          <div className="flex items-center justify-center mb-5">
            <h2 className="text-3xl font-bold text-gray-700">Products</h2>
            <button
              className="px-4 mx-2 py-2 bg-gray-700 text-white rounded hover:bg-blue-600"
              onClick={handleRefresh}
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  <span className="sr-only">Image</span>
                </th>
                <th scope="col" className="px-6 py-3">
                  Description
                </th>
                <th scope="col" className="px-6 py-3">
                  Product
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {productsForUI &&
                productsForUI.map((product) => (
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="w-32 p-4">
                      <img
                        src={
                          product.ProductImageUri === ""
                            ? PLACEHOLDER_IMG_URL
                            : product.ProductImageUri ?? ""
                        }
                        alt={product.ProductName}
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {product.ProductDescription}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {product.ProductName}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="font-medium text-red-600 dark:text-red-500 hover:underline cursor-pointer"
                        onClick={() =>
                          deleteProductMutation.mutate(product.ProductId)
                        }
                      >
                        Remove
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
export default ProductList;
