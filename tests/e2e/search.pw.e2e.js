import {
  clickOn,
  expectElementExist,
  expectTagsExistBySelector,
  getGridFileSelector,
  isDisabled,
  selectorFile,
  selectRowFiles,
  setSettings
} from './general.helpers';
import { startTestingApp, stopSpectronApp, testDataRefresh } from './hook';
import {
  createPwLocation,
  createPwMinioLocation,
  defaultLocationName,
  defaultLocationPath
} from './location.helpers';
import { emptyFolderName, searchEngine, testFilename } from './search.helpers';
import { AddRemoveTagsToSelectedFiles } from './perspective-grid.helpers';

describe('TST06 - Test Search in file structure:', () => {
  beforeAll(async () => {
    await startTestingApp('extconfig-with-welcome.js');
  });

  afterAll(async () => {
    await stopSpectronApp();
    await testDataRefresh();
  });
  beforeEach(async () => {
    if (global.isMinio) {
      await createPwMinioLocation('', defaultLocationName, true);
    } else {
      await createPwLocation(defaultLocationPath, defaultLocationName, true);
    }
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    // If its have opened file
    // await closeFileProperties();
  });

  it('TST0601 - Simple Search / filter the current folder [electron]', async () => {
    await global.client.dblclick(
      '[data-tid=fsEntryName_' + emptyFolderName + ']'
    );

    await searchEngine(testFilename); //, { reindexing: true });
    // expected current filename
    await expectElementExist(getGridFileSelector(testFilename), true, 5000);
    // await checkFilenameForExist(testFilename);
  });

  /*
  it('TST0602 - Search in sub folder: word with "?" in front of the query', async () => {
    await searchEngine('? ' + testFileInSubDirectory);
    // expected current filename
    await checkFilenameForExist(testFileInSubDirectory);
  });

  it('TST0602 - Advanced Search: word with "?" in front of the query', async () => {
    await searchEngine('? ' + testFileInSubDirectory);
    // expected current filename
    await checkFilenameForExist(testFileInSubDirectory);
  });

  it('TST0603 - Advanced Search: word with "!" symbol in front of the query', async () => {
    await searchEngine('! ' + testFileInSubDirectory);
    // expected current filename
    await checkFilenameForExist(testFileInSubDirectory);
  });

  it('TST0604 - Search for tag', async () => {
    await searchEngine('! ' + testFileInSubDirectory, searchTag);
    // expected current filename and tag
    await checkFilenameForExist(testFileInSubDirectory);
  });

  it('TST0604 - Advanced Search: word with "+" symbol in front of the query', async () => {
    await searchEngine('+ ' + testFileInSubDirectory);
  });

  it('TST0604 - Advanced Search: word and tag', async () => {
    await searchEngine('+ ' + testFileInSubDirectory);
    // expected current filename and tag
    await checkFilenameForExist(testFilename, searchTag);
  });

  it('Advanced Search: test with regex query', async () => {
    await searchEngine(regexQuery);
    // expected current filename
    await checkFilenameForExist(testFileInSubDirectory);
  });

  it('Advanced Search: reset button', async () => {
    await searchEngine(testFileInSubDirectory, searchTag, true);
    // expected to reset all search engine
  });*/

  async function addRemoveTagsInSearchResults(
    tags = ['test-tag3', 'test-tag4']
  ) {
    await global.client.dblclick(
      '[data-tid=fsEntryName_' + emptyFolderName + ']'
    );
    await searchEngine(testFilename); //, { reindexing: true });
    // expected current filename
    await expectElementExist(getGridFileSelector(testFilename), true, 5000);

    let selectedIds = await selectRowFiles([0]);

    await AddRemoveTagsToSelectedFiles(tags);

    for (let i = 0; i < selectedIds.length; i++) {
      await expectElementExist(
        // selectorFile + '[' + (i + 1) + ']//div[@id="gridCellTags"]//button[1]',
        '[data-tid=tagContainer_' + tags[0] + ']',
        true,
        5000
      );
    }
    if (await isDisabled('[data-tid=gridPerspectiveAddRemoveTags]')) {
      //select rows to enable button
      selectedIds = await selectRowFiles([0]);
    }
    await AddRemoveTagsToSelectedFiles(tags, false);

    for (let i = 0; i < selectedIds.length; i++) {
      await expectElementExist(
        selectorFile + '[' + (i + 1) + ']//div[@id="gridCellTags"]//button[1]',
        false,
        1500
      );
      await expectTagsExistBySelector(
        '[data-entry-id="' + selectedIds[i] + '"]',
        tags,
        false
      );
    }
  }

  it('TST0624 - Add/Remove sidecar tags in search results [electron]', async () => {
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    await addRemoveTagsInSearchResults(['sidecar-tag5', 'sidecar-tag6']);
  });

  it('TST0625 - Add/Remove filename tags in search results [electron]', async () => {
    await addRemoveTagsInSearchResults(['filename-tag5', 'filename-tag6']);
  });
});
