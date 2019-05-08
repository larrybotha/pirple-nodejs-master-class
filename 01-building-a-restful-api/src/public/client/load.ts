import {loadAccountEditPage} from './account';

// Load data on the page
const loadDataOnPage = () => {
  // Get the current page from the body class
  const bodyClasses = document.querySelector('body').classList;
  const primaryClass =
    typeof bodyClasses[0] === 'string' ? bodyClasses[0] : false;

  // Logic for account settings page
  if (primaryClass === 'account-edit') {
    loadAccountEditPage();
  }
};

export {loadDataOnPage};
