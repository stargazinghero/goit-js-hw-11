import Notiflix from 'notiflix';

import GalleryApiService from './js/api-service';
import galleryCardTpl from './templates/gallery-card.hbs';

import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';

import './css/common.css';

const refs = {
  form: document.querySelector('.search-form'),
  container: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

const galleryApiService = new GalleryApiService();
let sumHits = galleryApiService.perPage;

let gallery = new SimpleLightbox('.gallery a');

refs.form.addEventListener('submit', onSearch);
refs.loadMore.addEventListener('click', onLoadMore);
refs.loadMore.classList.add('is-hidden');

function onSearch(e) {
  e.preventDefault();

  if (!refs.loadMore.classList.contains('is-hidden')) {
    refs.loadMore.classList.add('is-hidden');
  }

  galleryApiService.searchQuery = e.currentTarget.elements.searchQuery.value;
  galleryApiService.resetPage();
  galleryApiService.getImages().then(images => {
    if (images.hits.length === 0 || galleryApiService.searchQuery.trim() === '') {
      return Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.',
      );
    }
    resetRenderGallery();
    renderGallery(images.hits);
    scrollWindow(images.hits.length / 4);
    gallery.refresh();
    refs.loadMore.classList.remove('is-hidden');
    Notiflix.Notify.info(`Hooray! We found ${images.totalHits} images.`);
  });
}

function onLoadMore() {
  galleryApiService.getImages().then(images => {
    sumHits += images.hits.length;
    if (images.totalHits === sumHits) {
      refs.loadMore.classList.add('is-hidden');
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
    renderGallery(images.hits);
    scrollWindow(images.hits.length / 4);
    gallery.refresh();
  });
}

function renderGallery(images) {
  refs.container.insertAdjacentHTML('beforeend', galleryCardTpl(images));
}

function resetRenderGallery() {
  refs.container.innerHTML = '';
}

function scrollWindow(count) {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * count + cardHeight,
    behavior: 'smooth',
  });
}
