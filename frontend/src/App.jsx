import React from 'react'
import { Route, Routes } from 'react-router-dom';
import CreateBook from './pages/CreateBook';
import DeleteBook from './pages/DeleteBook';
import GetBook from './pages/GetBook';
import Home from './pages/Home';
import UpdateBook from './pages/UpdateBook';
const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/books/create' element={<CreateBook />}/>
      <Route path='/books/delete' element={<DeleteBook />}/>
      <Route path='books/get/:id' element={<GetBook />}/>
      <Route path='/books/update/:id' element={<UpdateBook />}/>  
    </Routes>
  )
}

export default App;
