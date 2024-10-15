// export async function autoCompletePostCode(postcode: string) {
//   const autocompleteResult = await postcodeApi.autocomplete(postcode);

//   if (autocompleteResult.isSuccess) {
//     const success = autocompleteResult.toSuccess();

//     return success.suggestions;
//   } else {
//     const failed = autocompleteResult.toFailed();
//     console.log(failed);
//   }
// }

// export async function findAddress(postcode: string) {
//   const findAddressResult = await postcodeApi.find(postcode);

//   if (findAddressResult.isSuccess) {
//     const success = findAddressResult.toSuccess();

//     return success.addresses.addresses;
//   } else {
//     const failed = findAddressResult.toFailed();
//     console.log(failed);
//   }
// }
