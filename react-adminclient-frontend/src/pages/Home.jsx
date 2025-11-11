import React from 'react'
import Banner from '../components/Banner'
import NewsList from '../components/NewsList'
import ProductGrid from '../components/ProductGrid'
import ImageGallery from '../components/ImageGallery'

const Home = () => {
  return (
    <>
    <Banner />
    <ProductGrid />
    <ProductGrid category="mo-hinh-onpice" />
    <ProductGrid category="Dragon-ball" />
    <NewsList />
    <ImageGallery />
    </>
  )
}

export default Home