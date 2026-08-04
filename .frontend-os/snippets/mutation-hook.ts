// import { useMutation, useQueryClient } from "@tanstack/react-query";

// export function useCreateExample() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async () => {},
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["examples"] });
//     },
//   });
// }