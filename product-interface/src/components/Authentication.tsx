import { FormEvent, useState, useEffect } from "react";
import { UseMutationResult, useMutation } from "react-query";
import ProductList from "./ProductList";
import { IProductType, fetchProduct } from "../data/apicalls";

export const APIKeyInput = () => {
  const storedApiKey = localStorage.getItem("X-Api-Key") || "";
  const [apiKey, setApiKey] = useState<string>(storedApiKey);
  const [showProductList, toggleProductListPage] = useState<boolean>(false);

  const authenticationMutation: UseMutationResult<
    IProductType[],
    Error,
    string,
    unknown
  > = useMutation({
    mutationFn: () => fetchProduct(),
    onSuccess: () => {
      toggleProductListPage(true);
    },
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem("X-Api-Key");

    if (storedApiKey) {
      authenticationMutation.mutate(storedApiKey);
    }
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem("X-Api-Key", apiKey);
    authenticationMutation.mutate(apiKey);
  };

  return (
    <>
      {showProductList === false ? (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Enter API Key</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mb-4"
              />
              <button
                type="submit"
                className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      ) : (
        <ProductList />
      )}
    </>
  );
};
