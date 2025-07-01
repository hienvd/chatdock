# ChatDock

A simple Electron application to display multiple web services (like Google Chat and Slack) in a single window using a tabbed interface.

This app uses Electron's `WebContentsView` for better performance, security, and control over embedded web content.

## Features

- **Tabbed Interface**: Easily switch between different web services.
- **Modern Electron API**: Uses `WebContentsView` instead of the older `<webview>` tag.
- **Configurable URLs**: Easily change the URLs for the services by editing a configuration file.

## Installation

1.  Clone the repository.
2.  Install the dependencies:
    ```bash
    npm install
    ```

## Running the Application

To start the app, run the following command in the project directory:

```bash
npm start
```

### Running with PM2

You can use [PM2](https://pm2.keymetrics.io/) to manage and keep the application running in the background, which is useful for production or auto-restarting on crash.

1. Install PM2 globally if you haven't already:
   ```bash
   npm install -g pm2
   ```
2. Start the application with PM2:
   ```bash
   pm2 start npm --name chatdock -- start
   ```
3. To view logs:
   ```bash
   pm2 logs chatdock
   ```
4. To stop the application:
   ```bash
   pm2 stop chatdock
   ```
5. To restart the application:
   ```bash
   pm2 restart chatdock
   ```

For more PM2 commands and options, see the [PM2 documentation](https://pm2.keymetrics.io/docs/usage/quick-start/).

## Configuration

Before running the app, create a `config.json` file in the project root with your own URLs:

```json
{
  "chatUrl": "[https://your.chat.url](https://your.chat.url)",
  "slackUrl": "[https://your.slack.url](https://your.slack.url)"
}
