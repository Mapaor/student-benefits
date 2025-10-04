# 🎓 Student Benefits

A curated list of student benefits and discounts via .edu email

![Student Benefits Screenshot](https://github.com/user-attachments/assets/a45d2779-a743-401a-91d9-3f39e90f05c8)

## Features

- 📱 Responsive card-based design
- 🏷️ Filter benefits by category tags
- 🎨 Modern, clean UI with gradient background
- ⚡ Fast, client-side filtering
- 📦 Easy to add new benefits

## Usage

Simply open `index.html` in your web browser or host the files on any web server.

### Local Development

You can run a local server using Python:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/index.html` in your browser.

## Structure

- `benefits.json` - JSON file containing all student benefits data
- `index.html` - Main HTML page
- `styles.css` - CSS styles for the website
- `script.js` - JavaScript for loading and filtering benefits

## Adding New Benefits

To add a new benefit, edit `benefits.json` and add a new object with the following structure:

```json
{
  "title": "Service Name",
  "description": "Description of the student benefit",
  "imageSrc": "URL to the service logo/image",
  "tags": ["Category1", "Category2"]
}
```

The filter buttons will automatically update based on the tags used in the JSON file.

## License

MIT License - see [LICENSE](LICENSE) file for details
