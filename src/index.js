import supabase from "./supabase-client.js"


const { data, error } = await supabase
  .from('sales_deals')
  .select('name' , 'value')


console.log(data)
console.log(error)