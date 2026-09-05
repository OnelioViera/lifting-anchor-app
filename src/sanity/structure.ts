import type { StructureResolver } from 'sanity/structure'

// Customize the Studio's sidebar: pull the singleton "Calculator Settings"
// document out to its own item (no "create new" list), then list everything else.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Calculator Settings')
        .child(
          S.document()
            .schemaType('calculatorSettings')
            .documentId('calculatorSettings')
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'calculatorSettings'
      ),
    ])
