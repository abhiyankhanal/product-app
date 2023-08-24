
import { QueryClient, QueryClientProvider } from "react-query";
import { APIKeyInput } from "./Authentication";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <APIKeyInput />
    </QueryClientProvider>
  );
}

export default App;
