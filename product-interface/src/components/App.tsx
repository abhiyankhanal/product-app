
import { QueryClient, QueryClientProvider } from "react-query";
import ProductList from "./ProductList";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductList />
    </QueryClientProvider>
  );
}

export default App;
