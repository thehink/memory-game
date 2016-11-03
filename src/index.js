'use strict';

import App from './client/app';

App.render();

if (module.hot) {
  module.hot.accept();
}
