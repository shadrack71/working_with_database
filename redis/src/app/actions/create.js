'use server'

import client from "@/app/lib/db"
import { redirect } from 'next/navigation'

export async function createBook(formData) {
  const {title, rating, author, blurb} = Object.fromEntries(formData)

  const id = Math.floor(Math.random()*100000)

  await client.hSet(`storybooks:${id}`,{
    title,
    rating,
    author,
    blurb
  })

  redirect('/')
}