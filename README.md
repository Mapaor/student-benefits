# 🎓 Student Benefits

A curated list of student benefits and discounts via .edu email. 

## Benefits as a website
Access it here: [studentbenefits.qzz.io](https://studentbenefits.qzz.io).

![Student Benefits Screenshot](assets/preview.jpg)

## Goal of this project

The goal is to fully feature all the interesting or appealing student benefits there are on the internet. Not only the ones from the GitHub Student Pack, but any education-related benefit provided by a company or organization.

![Student Benefits Zoom Out Screenshot](assets/screenshot-full-page.png)

> Screenshot of the initial list.

## Benefits as a list

<details>
<summary>List of Student Benefits</summary>

- GitHub Student Developer Pack
  - GitHub Copilot Pro
  - JetBrains IDEs
  - AppWrite Pro
- Notion Education Plus
- Figma Pro
- AutoDesk Suite
- Cursor Pro
- GitHub Copilot Pro
- Office 365
- ... (pending)
</details>

## Adding New Benefits

Do you know a benefit that is missing in the list? Open a GitHub issue or simply edit `benefits.json` and make a pull request. Each benefit has the following structure:

```json
{
  "title": "Service Name",
  "description": "Description of the student benefit",
  "imageSrc": "URL to the service logo/image",
  "tags": ["Category1", "Category2"]
}
```

The `description` property is the only one allowed to contain HTML elements (like `<br>`, `<a href='https://example.com'>example.com</a>`, `<strong>important</strong>` or similar).

An additional boolean key `campusRequired` can be set to `false` for indicating that enrollment can't be done directly by the student (it needs to be done either by a professor or by the whole university or campus).

## License

MIT License. See [LICENSE](LICENSE) file for details.
