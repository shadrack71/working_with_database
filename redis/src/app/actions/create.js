'use server'

import client from "@/app/lib/db"
import { redirect } from 'next/navigation'

export async function createBook(formData) {
  const {title, rating, author, blurb} = Object.fromEntries(formData)

  const id = Math.floor(Math.random()*100000)

  const unique = await client.zAdd('storybooks',{
    value:title,
    score:id
  },{NX:true})
  if(!unique){

    return { error:'The book already existed' }

  }

  await client.hSet(`storybooks:${id}`,{
    title,
    rating,
    author,
    blurb
  })

  redirect('/')
}