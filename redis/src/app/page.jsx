import client from "@/app/lib/db"
import Link from 'next/link'


const getBooks = async () => {

  const result = await client.zRangeWithScores('storybooks',0,-1)
  const books = await Promise.all(result.map(async(b)=>{
    return await client.hGetAll(`storybooks:${b.score}`)
  }))

  return books

  
}

export default async function Home() {

  const books = await getBooks()

  return (
    <main>
      <nav className="flex justify-between">
        <h1 className='font-bold'>Books on Redis!</h1>
        <Link href="/create" className="btn">Add a new book</Link>
      </nav>
      
      <p>List of books here.</p>
      {
          books.map((book, index) => (
          <div key={`${book.title}-${index}`} className="card">
          <h2>{book.title}</h2>
          <p>By {book.author}</p>
          <p>{book.blurb}</p>
          <p>Rating: {book.rating}</p>
        </div>
      ))
      }
    </main>
  )
}