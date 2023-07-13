import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('radio styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['radio'], runner, cliAppTree);
    expect(tree.readContent(THEME_FILE)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  describe('mixin migrations', () => {
    it('should replace the old theme with the new ones', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-radio-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.radio-theme($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.legacy-radio-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.radio-theme($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.legacy-radio-theme($light-theme);
        @include mat.legacy-radio-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.radio-theme($light-theme);
        @include mat.radio-theme($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.legacy-radio-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.radio-theme($theme);


      `,
      );
    });

    it('should update color mixin', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-radio-color($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.radio-color($theme);
      `,
      );
    });

    it('should update typography mixin', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-radio-typography($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.radio-typography($theme);
      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-radio-group classname', async () => {
      await runMigrationTest(
        `
        .mat-radio-group {
          display: block;
        }
      `,
        `
        .mat-mdc-radio-group {
          display: block;
        }
      `,
      );
    });

    it('should update multiple legacy classnames', async () => {
      await runMigrationTest(
        `
        .mat-radio-button {
          display: block;
        }
        .mat-radio-group {
          padding: 16px;
        }
      `,
        `
        .mat-mdc-radio-button {
          display: block;
        }
        .mat-mdc-radio-group {
          padding: 16px;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-radio-button, .another-class {
          display: block;
        }
      `,
        `
        .some-class.mat-mdc-radio-button, .another-class {
          display: block;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-radio-button,
        .another-class { padding: 16px; }
      `,
        `
        .some-class,
        .mat-mdc-radio-button,
        .another-class { padding: 16px; }
      `,
      );
    });

    it('should add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-radio-label-content {
          font-size: 24px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of radio that may no longer apply for the MDC version. */
        .mat-radio-label-content {
          font-size: 24px;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-radio-container {
          padding: 16px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of radio that may no longer apply for the MDC version. */
        .some-class
        .mat-radio-container {
          padding: 16px;
        }
      `,
      );
    });

    it('should update the legacy mat-radio-group class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-radio-group.some-class, .mat-radio-container {
          padding: 16px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of radio that may no longer apply for the MDC version. */
        .mat-mdc-radio-group.some-class, .mat-radio-container {
          padding: 16px;
        }
      `,
      );
    });
  });
});
