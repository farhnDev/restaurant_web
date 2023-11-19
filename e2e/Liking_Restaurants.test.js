const assert = require('assert');

// eslint-disable-next-line no-undef
Feature('Liking Restaurants');

// eslint-disable-next-line no-undef
Before(({ I }) => {
  I.amOnPage('/#/like');
});

// eslint-disable-next-line no-undef
Scenario('showing empty liked restaurants', ({ I }) => {
  I.seeElement('.restaurants');
  I.dontSee('Tidak ada restaurant untuk ditampilkan', '.restaurant-item__not__found');
});

// eslint-disable-next-line no-undef
Scenario('liking one restaurant', async ({ I }) => {
  I.amOnPage('/#/like');

  // Pastikan halaman '/#/like' terbuka
  I.seeElement('.restaurants');
  I.dontSee('Tidak ada restaurant untuk ditampilkan', '.restaurant-item__not__found');

  // Navigasi kembali ke halaman utama
  I.amOnPage('/');

  // Pastikan elemen ".card-content .lengkap" terlihat
  I.seeElement('.card-content .lengkap');

  // Dapatkan teks dari restoran pertama
  const firstRestaurantName = await I.grabTextFrom('.restaurant__title');
  I.click('.card-content .lengkap');

  // Lakukan aksi 'like' pada restoran
  I.wait(2);
  I.seeElement('#likeButton');
  I.click('#likeButton');
  I.amOnPage('/#/like');
  I.seeElement('.card');

  // Dapatkan teks dari restoran yang disukai
  const likedRestaurantName = await I.grabTextFrom('.restaurant__title');

  // Periksa apakah restoran yang disukai sesuai dengan yang pertama kali dilihat
  assert.strictEqual(firstRestaurantName, likedRestaurantName);
});

// eslint-disable-next-line no-undef
Scenario('unliking one restaurant', async ({ I }) => {
  I.amOnPage('/#/like');
  const isRestaurantLiked = await I.grabNumberOfVisibleElements('.card') > 0;

  if (isRestaurantLiked) {
    // eslint-disable-next-line no-undef
    const firstLikedRestaurant = locate('.card').first();
    const firstLikedRestaurantTitle = await I.grabTextFrom(firstLikedRestaurant);

    I.click('.card');
    I.dontSeeElement('.card');
    I.amOnPage('/#/like');
    I.dontSee(firstLikedRestaurantTitle, '.restaurant__title');
  } else {
    // eslint-disable-next-line no-console
    console.log('No liked restaurants to unlike.');
  }
});
// eslint-disable-next-line no-undef
Scenario('searching restaurants', async ({ I }) => {
  // Pastikan tidak ada pesan 'Tidak ada restaurant untuk ditampilkan'
  I.dontSee('Tidak ada restaurant untuk ditampilkan', '.restaurant-item__not__found');

  // Akses halaman utama
  I.amOnPage('/');

  // Pastikan ada elemen ".card-content .lengkap"
  I.seeElement('.card-content .lengkap');

  const names = [];

  // Klik beberapa restoran untuk menyukainya
  for (let i = 1; i <= 3; i++) {
    I.click(locate('.card-content .lengkap').at(i));
    I.seeElement('#likeButton');
    I.click('#likeButton');
    I.wait(2);
    names.push(await I.grabTextFrom('.restaurant__title'));
    // Kembali ke halaman utama
    I.amOnPage('/');
  }

  // Buka halaman '/#/like'
  I.amOnPage('/#/like');
  I.seeElement('#query');

  // Periksa jumlah restoran yang disukai
  const visibleLikedRestaurants = await I.grabNumberOfVisibleElements('.card');
  assert.strictEqual(names.length, visibleLikedRestaurants);

  // Ambil query pencarian dari restoran yang disukai
  const searchQuery = names[1].substring(1, 3);

  // Lakukan pencarian
  I.fillField('#query', searchQuery);
  I.pressKey('Enter');

  // Pastikan hasil pencarian sesuai dengan ekspektasi
  const matchingRestaurants = names.filter((name) => name.indexOf(searchQuery) !== -1);
  const visibleSearchedLikedRestaurants = await I.grabNumberOfVisibleElements('.card');
  assert.strictEqual(matchingRestaurants.length, visibleSearchedLikedRestaurants);

  // Verifikasi setiap restoran yang ditampilkan sesuai dengan hasil pencarian
  for (let i = 0; i < matchingRestaurants.length; i++) {
    const visibleName = await I.grabTextFrom(locate('.restaurant__title').at(i + 1));
    assert.strictEqual(matchingRestaurants[i], visibleName);
  }
});
