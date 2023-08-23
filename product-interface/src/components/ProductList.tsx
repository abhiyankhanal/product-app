import { useState } from "react";
import { AiFillDelete, AiFillPlusCircle } from "react-icons/ai";
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

const ProductList = (): JSX.Element => {
  ReactModal.setAppElement("#root");
  const {
    data: products,
    error,
    isError,
    isLoading,
  }: UseQueryResult<IProductType[], Error> = useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchProduct(),
  });

  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  // const mutation = useMutation((id: string) => deleteProduct(id), {
  //   onSuccess: () => {
  //     queryClient.invalidateQueries("products");
  //   },
  // });

  // const deleteHandler = (id: string) => {
  //   mutation.mutate(id);
  // };

  const deleteProductMutation: UseMutationResult<void, Error, string> =
    useMutation({
      mutationFn: (productId: string) => deleteProduct(productId),
      onSuccess: () => {
            queryClient.invalidateQueries("products");
          },
    });

  let productsForUI: IProductType[];
  productsForUI = dummyProducts;
  if (isLoading) {
    productsForUI = dummyProducts;
  } else if (products) {
    productsForUI = products;
  }
  if (isError) return <span>Error: {error.message}</span>;

  return (
    <>
      <div className="flex flex-col items-center justify-center mt-4">
        <h2 className="text-3xl font-bold mb-4 text-center mx-2">Products</h2>
        {productsForUI &&
          productsForUI.map((product) => (
            <div
              key={product.productId}
              className="bg-white shadow overflow-hidden sm:rounded-md mb-4 flex items-center justify-between px-4 py-2 mx-2"
            >
              <img
                className="w-16 h-16 flex-1 mx-2"
                src={
                  product.imageUri ?? process.env.REACT_APP_PLACEHOLDER_IMAGE
                }
                alt={product.productName}
              />
              <p className="text-l flex-1 mx-2">{product.productName}</p>
              <p className="text-l flex-1 mx-2">{product.description}</p>
              <button
                onClick={() => deleteProductMutation.mutate(product.productId)}
                className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-700 flex items-center justify-center flex-1"
              >
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
