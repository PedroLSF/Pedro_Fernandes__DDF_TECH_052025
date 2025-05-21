/// <reference types="cypress" />

Cypress.Commands.add(
  'login',
  (
    user = Cypress.env('user_name'),
    password = Cypress.env('user_password'),
    { cacheSession = true } = {}
  ) => {
    const login = () => {
      cy.visit('/auth/jwt/login');
      cy.get(`[data-cy="login-email"]`).type(user);
      cy.get(`[data-cy="login-password"]`).type(password, { log: false });
      cy.intercept('GET', '**/dashboard').as('me');
      cy.get(`[data-cy="login-enter"]`).click();
      cy.wait('@me');
    };

    const validate = () => {
      cy.visit('/');
      cy.location('pathname', { timeout: 1000 }).should('not.eq', '/auth/jwt/login');
    };

    const options = {
      cacheAcrossSpecs: true,
      validate,
    };

    if (cacheSession) {
      cy.session(user, login, options);
    } else {
      login();
    }
  }
);

Cypress.Commands.add('logout', () => {
  cy.get('.MuiAvatar-img', { timeout: 6000 }).click();
  cy.contains('Sair').click();
});

Cypress.Commands.add('createTag', (name) => {
  cy.get('[data-cy="nav-item-tags"]').click();
  cy.get('[data-cy="list-new-tag"]').click();
  cy.get('[data-cy="tag-name"]').type(name);
  cy.get('[data-cy="tag-color"]').click();
  cy.get('[data-cy="vermelho-color"]').click();
  cy.get('[data-cy="tag-save"]').click();
});

Cypress.Commands.add('bulkActives', () => {
  cy.get('[data-cy="nav-item-tags"]').click();
  cy.intercept('PUT', '**/tag/**').as('putTags');
  cy.get('[data-cy^="tag-row-tag_"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createTag(`Tag-${Math.random()}`);
      elements += 1;
    }
  });
  cy.get('[data-cy^="tag-checkbox-tag_"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="tag-all-active"]').click();
    cy.get('[data-cy="tag-active"]').click();
    cy.wait('@putTags');

    indices.forEach((index) => {
      const tagElement = cy.get(`[data-cy^="tag-row-tag_"]`).eq(index as number);
      tagElement.within(() => {
        cy.contains('span', 'Ativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('bulkInactives', () => {
  cy.get('[data-cy="nav-item-tags"]').click();
  cy.intercept('PUT', '**/tag/**').as('putTags');
  cy.get('[data-cy^="tag-row-tag_"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createTag(`Tag-${Math.random()}`);
      elements += 1;
    }
  });
  cy.get('[data-cy^="tag-checkbox-tag_"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="tag-all-inactive"]').click();
    cy.get('[data-cy="tag-inactive"]').click();
    cy.wait('@putTags');

    indices.forEach((index) => {
      const tagElement = cy.get(`[data-cy^="tag-row-tag_"]`).eq(index as number);
      tagElement.within(() => {
        cy.contains('span', 'Inativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('tagQuickEdit', () => {
  cy.get('[data-cy="nav-item-tags"]').click();
  cy.get('[data-cy^="tag-pencil-tag_"]').then(($elements) => {
    if ($elements.length < 1) {
      throw new Error('Element not found');
    }
    const randomIndex = Math.floor(Math.random() * $elements.length);
    const randomElement = $elements.eq(randomIndex);
    randomElement.trigger('click');
    cy.get('[data-cy="tag-name"]').find('input').should('be.disabled');
    cy.get('[data-cy="tag-active"]').click();
    cy.get('[data-cy="ativo-status"]').click();
    cy.get('[data-cy="tag-save"]').click();
    cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Salvo com sucesso!');
  });
});

Cypress.Commands.add('deleteTag', () => {
  cy.get('[data-cy="nav-item-tags"]').click();
  cy.get('[data-cy^="tag-options-tag_"]').then(($elements) => {
    const totalElements = $elements.length;
    if (totalElements < 1) {
      throw new Error('Element not found');
    }
    const randomIndex = Math.floor(Math.random() * totalElements);
    const randomElement = $elements.eq(randomIndex);
    cy.wrap(randomElement).trigger('click');
    cy.get('[data-cy^="tag-delete-tag_"]').click();
    cy.intercept('DELETE', '**/tag/**').as('deleteTag');
    cy.get('[data-cy="tag-delete"]').click();
    cy.wait('@deleteTag').then((interception) => {
      expect(interception.request.url).to.include('tag_');
      expect(interception.request.method).to.equal('DELETE');
      expect(interception.response?.statusCode).to.equal(200);
    });
    cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Tag deletada!');
  });
});

Cypress.Commands.add('createRole', (name, permission) => {
  cy.get('[data-cy="nav-item-roles"]').click();
  cy.get('[data-cy="list-new-role"]').click();
  cy.get('[data-cy="role-name"]').type(name);
  if (permission) {
    cy.get('[data-cy="role-tab-permission"]').click();
    cy.get('[data-cy="raw-videos-view-raw-videos"]').click();
  }
  cy.get('[data-cy="role-button"]').click();
});

Cypress.Commands.add('roleQuickEdit', () => {
  cy.get('[data-cy="nav-item-roles"]').click();
  cy.get('[data-cy^="role-pencil-role_"]').then(($elements) => {
    if ($elements.length < 1) {
      throw new Error('Element not found');
    }
    const randomIndex = Math.floor(Math.random() * $elements.length);
    const randomElement = $elements.eq(randomIndex);
    randomElement.trigger('click');
    cy.get('[data-cy="role-quick-active"]').click();
    cy.get('[data-cy="role-Ativo"]').click();
    cy.get('[data-cy="role-quick-save-button"]').click();
    cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Salvo com sucesso!');
  });
});

Cypress.Commands.add('bulkActivesrole', () => {
  cy.get('[data-cy="nav-item-roles"]').click();
  cy.get('[data-cy^="role-row-"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createRole(`Função-${Math.random()}`);
      elements += 1;
    }
  });
  cy.get('[data-cy^="role-checkbox-"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="role-all-active"]').click();
    cy.get('[data-cy="role-active"]').click();

    indices.forEach((index) => {
      const roleElement = cy.get(`[data-cy^="role-row-"]`).eq(index as number);
      roleElement.within(() => {
        cy.contains('span', 'Ativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('bulkInactivesrole', () => {
  cy.get('[data-cy="nav-item-roles"]').click();
  cy.get('[data-cy^="role-row-"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createRole(`Função-${Math.random()}`);
      elements += 1;
    }
  });
  cy.get('[data-cy^="role-checkbox-"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="role-all-inactive"]').click();
    cy.get('[data-cy="role-inactive"]').click();

    indices.forEach((index) => {
      const roleElement = cy.get(`[data-cy^="role-row-"]`).eq(index as number);
      roleElement.within(() => {
        cy.contains('span', 'Inativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('deleteRole', (name) => {
  if (name) {
    cy.get('[data-cy="nav-item-roles"]').click();
    cy.get(`[data-cy="role-options-${name}"]`).click();
    cy.get(`[data-cy="role-delete-${name}"]`).click();
    cy.intercept('DELETE', '**/role/**').as('deleteRole');
    cy.get('[data-cy="role-delete"]').click();
    cy.wait('@deleteRole').then((interception) => {
      expect(interception.request.url).to.include('role');
      expect(interception.request.method).to.equal('DELETE');
      expect(interception.response?.statusCode).to.equal(200);
    });
    cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Função deletada!');
  } else {
    cy.get('[data-cy="nav-item-roles"]').click();
    cy.get('[data-cy^="role-options-"]').then(($elements) => {
      const totalElements = $elements.length;
      if (totalElements < 1) {
        throw new Error('Element not found');
      }
      const randomIndex = Math.floor(Math.random() * totalElements);
      const randomElement = $elements.eq(randomIndex);
      cy.wrap(randomElement).trigger('click');
      cy.get('[data-cy^="role-delete-"]').click();
      cy.intercept('DELETE', '**/role/**').as('deleteRole');
      cy.get('[data-cy="role-delete"]').click();
      cy.wait('@deleteRole').then((interception) => {
        expect(interception.request.url).to.include('role');
        expect(interception.request.method).to.equal('DELETE');
        expect(interception.response?.statusCode).to.equal(200);
      });
      cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Função deletada!');
    });
  }
});

Cypress.Commands.add('createUser', (name, email) => {
  cy.get('[data-cy="nav-item-users"]').click();
  cy.get('[data-cy="new-user-button"]').click();
  cy.get('[data-cy="user-name"]').type(name);
  cy.get('[data-cy="user-email"]').type(email);
  cy.get('[data-cy="user-save"]').click();
});

Cypress.Commands.add('bulkActivesUser', () => {
  cy.get('[data-cy="nav-item-users"]').click();
  cy.intercept('PUT', '**/user/**').as('putUser');
  cy.get('[data-cy^="user-row-"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createUser(`Nome-${Math.random()}`, Cypress.env('email_user'));
      elements += 1;
    }
  });
  cy.get('[data-cy^="user-checkbox-"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="user-all-active"]').click();
    cy.get('[data-cy="user-active"]').click();
    cy.wait('@putUser');

    indices.forEach((index) => {
      const userElement = cy.get(`[data-cy^="user-row-"]`).eq(index as number);
      userElement.within(() => {
        cy.contains('span', 'Ativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('bulkInactivesUser', () => {
  cy.get('[data-cy="nav-item-users"]').click();
  cy.intercept('PUT', '**/user/**').as('putUser');
  cy.get('[data-cy^="user-row-"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createUser(`Nome-${Math.random()}`, Cypress.env('email_user'));
      elements += 1;
    }
  });
  cy.get('[data-cy^="user-checkbox-"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="user-all-inactive"]').click(); // data-cy
    cy.get('[data-cy="user-inactive"]').click(); // data-cy
    cy.wait('@putUser');

    indices.forEach((index) => {
      const userElement = cy.get(`[data-cy^="user-row-"]`).eq(index as number);
      userElement.within(() => {
        cy.contains('span', 'Inativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('createCategory', (name, isEntity = false) => {
  cy.get('[data-cy="nav-item-categories"]').click();
  cy.get('[data-cy="new-category-create"]').click();
  cy.get('[data-cy="category-name-new-edit"]').type(name);

  if (isEntity) {
    cy.get('[data-cy="category-entity"]').click();
  } else {
    cy.get('[data-cy="category-selector-button"]').click();
    cy.get('[data-cy="category-selector-tree"]')
      .find('[data-cy^="category-selector-"]')
      .last()
      .click();
    cy.get('[data-cy="category-selector-tree-button"]').click();
  }

  cy.get('[data-cy="save-button-new-edit"]').click();
  cy.get('[data-cy="tab-category-table"]').click();
});

Cypress.Commands.add('categoryQuickEdit', (name) => {
  cy.get('[data-cy="nav-item-categories"]').click();
  cy.get('[data-cy="tab-category-table"]').click();
  cy.get('[data-cy^="category-quick-edit-button-"]').then(($elements) => {
    if ($elements.length < 1) {
      throw new Error('Element not found');
    }
    const randomIndex = Math.floor(Math.random() * $elements.length);
    const randomElement = $elements.eq(randomIndex);
    cy.wrap(randomElement).trigger('click');
    cy.get('[data-cy="category-quick-edit-name"]').type('{selectall}{backspace}').type(name);
    cy.get('[data-cy="category-quick-edit-status"]').click();
    cy.get('#menu-active > .MuiPaper-root').within(() => {
      cy.get('[data-cy="Inactive"]').click();
    });
    cy.get('[data-cy="category-quick-edit-save-button"]').click();
    cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Salvo com sucesso!');
  });
});

Cypress.Commands.add('bulkInactivesCategory', () => {
  cy.get('[data-cy="nav-item-categories"]').click();
  cy.get('[data-cy="tab-category-table"]').click();
  cy.intercept('PUT', '**/category/**').as('putCategory');
  cy.get('[data-cy^="category-row-cat_"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createCategory(Math.random() as unknown as string, true);
      elements += 1;
    }
  });
  cy.get('[data-cy^="category-checkbox-"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });

    cy.get('[data-cy="category-all-inactive"]').click();
    cy.get('[data-cy="category-inactive"]').click();
    cy.wait('@putCategory');

    indices.forEach((index) => {
      const categoryElement = cy.get(`[data-cy^="category-row-cat_"]`).eq(index as number);
      categoryElement.within(() => {
        cy.contains('td', 'Inativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('bulkActivesCategory', () => {
  cy.get('[data-cy="nav-item-categories"]').click();
  cy.get('[data-cy="tab-category-table"]').click();
  cy.intercept('PUT', '**/category/**').as('putCategory');
  cy.get('[data-cy^="category-row-cat_"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createCategory(Math.random() as unknown as string, true);
      elements += 1;
    }
  });
  cy.get('[data-cy^="category-checkbox-"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="category-all-active"]').click();
    cy.get('[data-cy="category-active"]').click();
    cy.wait('@putCategory');

    indices.forEach((index) => {
      const categoryElement = cy.get(`[data-cy^="category-row-cat_"]`).eq(index as number);
      categoryElement.within(() => {
        cy.contains('td', 'Ativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('deleteCategory', () => {
  cy.get('[data-cy="nav-item-categories"]').click();
  cy.get('[data-cy^="category-options-button-"]').then(($elements) => {
    const totalElements = $elements.length;
    if (totalElements < 1) {
      throw new Error('Element not found');
    }
    const randomIndex = Math.floor(Math.random() * totalElements);
    const randomElement = $elements.eq(randomIndex);
    cy.wrap(randomElement).trigger('click');
    cy.get('[data-cy="delete-row"]').click();
    cy.intercept('DELETE', '**/category/**').as('deleteCategory');
    cy.get('[data-cy="confirm-delete"]').click();
    cy.wait('@deleteCategory').then((interception) => {
      expect(interception.request.url).to.include('category');
      expect(interception.request.method).to.equal('DELETE');
      expect(interception.response?.statusCode).to.equal(200);
    });
    cy.get('#notistack-snackbar')
      .should('be.visible')
      .should('contain.text', 'Categoria deletada!');
  });
});

Cypress.Commands.add('createContent', (categoryName) => {
  cy.createCategory(categoryName);
  cy.get('[data-cy="nav-item-content"]').click();
  cy.intercept('GET', '**/notification/**').as('loadPage');
  cy.intercept('GET', '**/dashboard/**').as('loadPage');
  cy.intercept('GET', '**/upload-content/**').as('loadPage');
  cy.get('[data-cy="upload-encode-content-video-button"]').click();
  cy.wait('@loadPage');
  cy.wait(2000);
  cy.get('[data-cy="category-selector-button"]').first().click();
  cy.get('[data-cy^="category-selector-"] > .css-f3vv35 > .MuiTreeItem-label').last().click();
  cy.get('[data-cy="category-selector-tree-button"]').click();
  cy.get('[data-cy="upload-video-drawer"]').selectFile('cypress/fixture/raw-video-content.mp4', {
    action: 'drag-drop',
  });
  cy.intercept('PUT', '**/videos/**').as('upload');
  cy.get('[data-cy="upload-video-button"]').click();
  cy.wait('@upload');
  cy.get('#notistack-snackbar')
    .should('be.visible')
    .should('contain.text', 'raw-video-content.mp4 carregado!');
  cy.get('[data-cy="nav-item-content"]').click();
  const contentElement = cy.get('[data-cy^="view-content-details-vid_"]').first();
  contentElement.within(() => {
    cy.get('td')
      .eq(1)
      .find('div')
      .eq(2)
      .find('p')
      .eq(0)
      .should('contain.text', 'raw-video-content.mp4');
    cy.get('td').eq(4).find('div').eq(2).should('contain.text', 'Aguardando encode');
  });
});

Cypress.Commands.add('contentQuickEdit', (name) => {
  cy.get('[data-cy="nav-item-content"]').click();
  cy.get('[data-cy^="content-video-quick-edit-video_"]').then(($elements) => {
    if ($elements.length < 1) {
      throw new Error('Element not found');
    }
    const randomIndex = Math.floor(Math.random() * $elements.length);
    const randomElement = $elements.eq(randomIndex);
    randomElement.trigger('click');
    cy.get('[data-cy="content-title"]').type('{selectall}{backspace}').type(name);
    cy.get('[data-cy="content-quick-edit-status"]').click();
    cy.get('[data-cy="content-edit-active-Inactive"]').click();
    cy.get('[data-cy="content-save"]').click();
    cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Salvo com sucesso!');
    const contentElement = cy.get('[data-cy^="view-content-details-video_"]').eq(randomIndex);
    contentElement.within(() => {
      cy.contains('p', name).should('be.visible');
      cy.contains('td', 'Inativo').should('be.visible');
    });
  });
});

Cypress.Commands.add('bulkInactivesContent', () => {
  cy.get('[data-cy="nav-item-content"]').click();
  cy.intercept('PUT', '**/video/**').as('putVideos');
  cy.get('[data-cy="table-checkbox-all"]');

  cy.get('[data-cy^="content-checkbox-video_"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="content-all-inactive"]').click();
    cy.get('[data-cy="user-inactive"]').click();
    cy.wait('@putVideos');

    indices.forEach((index) => {
      const contentElement = cy.get(`[data-cy^="view-content-details-video_"]`).eq(index as number);
      contentElement.within(() => {
        cy.contains('td', 'Inativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('bulkActivesContent', () => {
  cy.get('[data-cy="nav-item-content"]').click();
  cy.intercept('PUT', '**/video/**').as('putVideos');
  cy.get('[data-cy^="view-content-details-video_"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createContent(`cat_${Math.random()}`);
      elements += 1;
    }
  });
  cy.get('[data-cy^="content-checkbox-video_"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="content-all-active"]').click();
    cy.get('[data-cy="user-active"]').click();
    cy.wait('@putVideos');

    indices.forEach((index) => {
      const contentElement = cy.get(`[data-cy^="view-content-details-video_"]`).eq(index as number);
      contentElement.within(() => {
        cy.contains('td', 'Ativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('contentThumbnail', () => {
  cy.get('[data-cy="nav-item-content"]').click();
  cy.intercept('PUT', '**/video/**').as('putVideos');
  cy.get('[data-cy^="view-content-details-video_"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createContent(`cat_${Math.random()}`);
      elements += 1;
    }
  });
  cy.get('[data-cy^="content-checkbox-video_"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="content-all-thumb"]').click();
    cy.intercept('PUT', '**/tag**').as('getImage');
    cy.intercept('PUT', '**/images/*').as('uploadImage');
    cy.get('[data-cy="image-upload"]').selectFile('cypress/fixture/thumbnail.png', {
      action: 'drag-drop',
    });
    cy.wait('@uploadImage');
    cy.get('[data-cy="upload-image-content-save"]').click();
    cy.get('[data-cy="nav-item-content"]').click();

    indices.forEach((index) => {
      const contentElement = cy.get(`[data-cy^="view-content-details-video_"]`).eq(index as number);
      contentElement
        .find('img')
        .should('exist')
        .then(($img) => {
          const src = $img.attr('src');
          expect(src).not.to.equal('/assets/images/videos/placeholder-video.png');
        });
    });
  });
});

Cypress.Commands.add('createChannel', (name, description, domainName, imagePath, addVideo) => {
  cy.get('[data-cy="nav-item-channels"]').click();
  cy.get('[data-cy="create-new-channel"]').click();
  cy.get('[data-cy="new-edit-name"]').type(name);
  cy.get('[data-cy="new-edit-desc"]').type(description);
  cy.get('[data-cy="new-edit-channel-type"]').click();
  if (!domainName) {
    cy.get('[data-cy="quick-edit-publico"]').click();
  }
  if (domainName) {
    cy.get('[data-cy="quick-edit-privado"]').click();
    cy.get('[data-cy="new-edit-dominio1"]').type(domainName);
  }
  if (imagePath) {
    cy.get('[data-cy="new-edit-has-avatar"]').click();
    cy.get('[data-cy="image-upload"]').selectFile(imagePath, {
      action: 'drag-drop',
    });
    cy.intercept('PUT', '**/images/*').as('upload');
    cy.wait('@upload');
  }
  cy.intercept('POST', '**/channel').as('postChannel');
  cy.get('[data-cy="new-edit-save-final"]').click();
  cy.wait('@postChannel');
  cy.get('#notistack-snackbar').should('be.visible');
  cy.contains('Novo canal criado!').should('be.visible');
  if (addVideo) {
    cy.get('[data-cy="channel-add-videos"]').click();
    cy.get('[data-cy^="add-"]').eq(1).click();
    cy.get('[data-cy^="remove-"]').first().click();
    cy.intercept('PUT', '**/channel/*').as('putChannel');
    cy.get('[data-cy="new-edit-save-final"]').click();
    cy.wait('@putChannel');
    cy.get('#notistack-snackbar').should('be.visible');
    cy.contains('Canal atualizado!').should('be.visible');
  }
});

Cypress.Commands.add('bulkInactivesChannel', () => {
  cy.get('[data-cy="nav-item-channels"]').click();
  cy.intercept('PUT', '**/channel/**').as('putChannel');
  cy.get('[data-cy^="channel-row-cha_"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createChannel('newChannel', 'channel description', undefined, 'cypress/fixture/image.jpg');
      elements += 1;
    }
  });
  cy.get('[data-cy^="channel-checkbox-"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="channel-all-inactive"]').click();
    cy.get('[data-cy="channel-inactive"]').click();
    cy.wait('@putChannel');

    indices.forEach((index) => {
      const channelElement = cy.get(`[data-cy^="channel-row-cha_"]`).eq(index as number);
      channelElement.within(() => {
        cy.contains('td', 'Inativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('bulkActivesChannel', () => {
  cy.get('[data-cy="nav-item-channels"]').click();
  cy.intercept('PUT', '**/channel/**').as('putChannel');
  cy.get('[data-cy^="channel-row-cha_"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createChannel('newChannel', 'channel description', undefined, 'cypress/fixture/image.jpg');
      elements += 1;
    }
  });
  cy.get('[data-cy^="channel-checkbox-"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="channel-all-active"]').click();
    cy.get('[data-cy="channel-active"]').click();
    cy.wait('@putChannel');

    indices.forEach((index) => {
      const channelElement = cy.get(`[data-cy^="channel-row-cha_"]`).eq(index as number);
      channelElement.within(() => {
        cy.contains('td', 'Ativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('channelQuickEdit', (name, oldName) => {
  cy.get('[data-cy="nav-item-channels"]').click();
  cy.get('[data-cy="type-channel-search"]').type(oldName);
  cy.get('[data-cy="search-button"]').click();
  cy.get(`[data-cy="channel-quick-edit-${oldName}"]`).click();
  cy.get('[data-cy="quick-edit-name"]').clear().type(name);
  cy.get('[data-cy="save-quick-edit"]').click();
  cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Salvo com sucesso!');
});

Cypress.Commands.add('createDirectories', (categoryName, directoryName) => {
  cy.get('[data-cy="nav-item-categories"]').click();
  cy.get('[data-cy="new-category-create"]').click();
  cy.get('[data-cy="category-name-new-edit"]').type(categoryName);
  cy.get('[data-cy="category-entity"]').click();
  cy.intercept('POST', '**/category').as('postCategory');
  cy.get('[data-cy="save-button-new-edit"]').click();
  cy.wait('@postCategory');
  cy.wait(1000);
  cy.get('body').then($body => {
    if ($body.find('[data-cy="nav-item-raw-content-manager"]').length > 0) {
      cy.get('[data-cy="nav-item-raw-content-manager"]').click();
    } else {
      cy.get('[data-cy="nav-item-raw-content"]').click();
      cy.get('[data-cy="nav-item-raw-content-manager"]').click();
    }
  });
  cy.intercept('GET', '*/raw-content/**').as('loadPage');
  cy.get(`[data-cy^="folder-cat_"]`).find(`[data-cy="folder-${categoryName}"]`).click();
  cy.wait('@loadPage');
  cy.wait(2000);
  cy.get('[data-cy="add-folder"]').first().click();
  cy.get('[data-cy="folder-name"]').type(directoryName);
  cy.intercept('POST', '**/category').as('postCategory');
  cy.get('[data-cy="create-button"]').click();
  cy.wait('@postCategory');
});

Cypress.Commands.add('createRawVideo', (categoryName) => {
  cy.get('body').then($body => {
    if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
      cy.get('[data-cy="nav-item-raw-content-list"]').click();
    } else {
      cy.get('[data-cy="nav-item-raw-content"]').click();
      cy.get('[data-cy="nav-item-raw-content-list"]').click();
    }
  });
  cy.intercept('GET', '**/upload-content/**').as('loadPage');
  cy.get('[data-cy="upload-raw-video-button"]').click();
  cy.wait('@loadPage');
  cy.wait(2000);
  cy.get('[data-cy="category-selector-button"]').click();
  if (categoryName) {
    cy.get('.css-1ftsfft > .simplebar-wrapper > .simplebar-mask > .simplebar-offset > .simplebar-content-wrapper > .simplebar-content').within(() => {
      cy.get('[data-cy="category-selector-tree"]')
        .find('[data-cy^="category-selector-"]')
        .find('[data-disabled]')
        .filter('[data-disabled="false"]');
      cy.contains(`${categoryName}`)
        .scrollIntoView()
        .click();
    });
  }
  else {
    cy.get('[data-cy="category-selector-tree"]')
      .find('[data-cy^="category-selector-"]')
      .find('[data-disabled]')
      .filter('[data-disabled="false"]')
      .last()
      .click();
  }
  cy.get('[data-cy="category-selector-tree-button"]').click();
  cy.get('[data-cy="upload-video-drawer"]').selectFile('cypress/fixture/raw-video-content.mp4', {
    action: 'drag-drop',
  });
  cy.intercept('PUT', '**/videos/**').as('upload');
  cy.get('[data-cy="upload-video-button"]').click();
  cy.wait('@upload');
  cy.get('.swal2-confirm').click();
  cy.get('[data-cy="nav-item-raw-content"]').click();
});

Cypress.Commands.add('bulkInactivesRawVideo', () => {
  cy.get('body').then($body => {
    if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
      cy.get('[data-cy="nav-item-raw-content-list"]').click();
    } else {
      cy.get('[data-cy="nav-item-raw-content"]').click();
      cy.get('[data-cy="nav-item-raw-content-list"]').click();
    }
  });
  cy.intercept('PUT', '**/video/**').as('putVideos');
  cy.get('[data-cy^="video-vid_"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createRawVideo();
      elements += 1;
    }
  });
  cy.get('[data-cy^="raw-video-checkbox-vid_"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="raw-content-all-inactive"]').click();
    cy.get('[data-cy="raw-content-inactive"]').click();
    cy.wait('@putVideos');

    indices.forEach((index) => {
      const rawVideoElement = cy.get(`[data-cy^="video-vid_"]`).eq(index as number);
      rawVideoElement.within(() => {
        cy.contains('td', 'Inativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('bulkActivesRawVideo', () => {
  cy.get('body').then($body => {
    if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
      cy.get('[data-cy="nav-item-raw-content-list"]').click();
    } else {
      cy.get('[data-cy="nav-item-raw-content"]').click();
      cy.get('[data-cy="nav-item-raw-content-list"]').click();
    }
  });
  cy.intercept('PUT', '**/video/**').as('putVideos');
  cy.get('[data-cy^="video-vid_"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createRawVideo();
      elements += 1;
    }
  });
  cy.get('[data-cy^="raw-video-checkbox-vid_"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="raw-content-all-active"]').click();
    cy.get('[data-cy="raw-content-active"]').click();
    cy.wait('@putVideos');

    indices.forEach((index) => {
      const rawVideoElement = cy.get(`[data-cy^="video-vid_"]`).eq(index as number);
      rawVideoElement.within(() => {
        cy.contains('td', 'Ativo').should('be.visible');
      });
    });
  });
});

Cypress.Commands.add('rawVideoQuickEdit', (name) => {
  cy.get('body').then($body => {
    if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
      cy.get('[data-cy="nav-item-raw-content-list"]').click();
    } else {
      cy.get('[data-cy="nav-item-raw-content"]').click();
      cy.get('[data-cy="nav-item-raw-content-list"]').click();
    }
  });
  cy.get('[data-cy^="raw-video-quick-edit-"]').first().click();
  cy.get('[data-cy="content-title"]').clear().type(name);
  cy.get('[data-cy="content-save"]').click();
  cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Salvo com sucesso!');
});

Cypress.Commands.add('deleteRawVideo', () => {
  cy.get('body').then($body => {
    if ($body.find('[data-cy="nav-item-raw-content-list"]').length > 0) {
      cy.get('[data-cy="nav-item-raw-content-list"]').click();
    } else {
      cy.get('[data-cy="nav-item-raw-content"]').click();
      cy.get('[data-cy="nav-item-raw-content-list"]').click();
    }
  });
  cy.intercept('DELETE', '**/video/**').as('deleteVideos');
  cy.get('[data-cy^="video-vid_"]').then(($elements) => {
    let elements = $elements.length;
    while (elements <= 3) {
      cy.createRawVideo();
      elements += 1;
    }
  });
  cy.get('[data-cy^="raw-video-checkbox-vid_"]').then(($elements) => {
    const totalElements = $elements.length;
    const indices = new Set();

    while (indices.size < 3) {
      const randomIndex = Math.floor(Math.random() * totalElements);
      indices.add(randomIndex);
    }

    indices.forEach((index) => {
      const randomElement = $elements.eq(index as number);
      cy.log(`${randomElement}`);
      cy.wrap(randomElement).trigger('click');
    });
    cy.get('[data-cy="raw-content-delete"]').click();
    cy.get('[data-cy="raw-content-delete-confirm"]').click();
    cy.wait(['@deleteVideos', '@deleteVideos', '@deleteVideos']).then((interceptions) => {
      expect(interceptions).to.have.length(3);

      interceptions.forEach((interception) => {
        expect(interception.request.url).to.include('video');
        expect(interception.request.method).to.equal('DELETE');
        expect(interception.response?.statusCode).to.equal(200);
      });
    });
    cy.get('#notistack-snackbar').should('be.visible').should('contain.text', 'Vídeos deletado!');
  });
});
declare namespace Cypress {
  interface Chainable {
    login(user?: string, password?: string): Chainable<void>;
    logout(): Chainable<void>;
    createTag(name: string): Chainable<void>;
    bulkActives(): Chainable<void>;
    bulkInactives(): Chainable<void>;
    tagQuickEdit(): Chainable<void>;
    deleteTag(): Chainable<void>;
    roleQuickEdit(): Chainable<void>;
    createRole(name: string, permission?: boolean): Chainable<void>;
    bulkActivesrole(): Chainable<void>;
    bulkInactivesrole(): Chainable<void>;
    deleteRole(name?: string): Chainable<void>;
    createUser(name: string, email: string): Chainable<void>;
    bulkActivesUser(): Chainable<void>;
    bulkInactivesUser(): Chainable<void>;
    createCategory(name: string, isEntity?: boolean): Chainable<void>;
    categoryQuickEdit(name: string): Chainable<void>;
    bulkInactivesCategory(): Chainable<void>;
    bulkActivesCategory(): Chainable<void>;
    deleteCategory(): Chainable<void>;
    createContent(categoryName: string): Chainable<void>;
    contentQuickEdit(name: string): Chainable<void>;
    bulkInactivesContent(): Chainable<void>;
    bulkActivesContent(): Chainable<void>;
    contentThumbnail(): Chainable<void>;
    createChannel(
      name: string,
      describe: string,
      domainName?: string,
      imagePath?: string,
      addVideo?: boolean
    ): Chainable<void>;
    bulkInactivesChannel(): Chainable<void>;
    bulkActivesChannel(): Chainable<void>;
    channelQuickEdit(name: string, oldName: string): Chainable<void>;
    createDirectories(name: string, nameCategory: string): Chainable<void>;
    createRawVideo(categoryName?: string): Chainable<void>;
    bulkActivesRawVideo(): Chainable<void>;
    bulkInactivesRawVideo(): Chainable<void>;
    rawVideoQuickEdit(name: string, categoryName?: string): Chainable<void>;
    deleteRawVideo(): Chainable<void>;
  }
}
