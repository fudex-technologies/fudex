const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'profile', '(protected-profile-routes-group)', 'account', 'loading.tsx');

try {
  fs.unlinkSync(filePath);
  console.log('File deleted successfully');
} catch (err) {
  console.error(err);
}
