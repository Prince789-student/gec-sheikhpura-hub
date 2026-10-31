const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../mobile_app/lib/screens/auth_screen.dart');
let c = fs.readFileSync(targetPath, 'utf8');

const methodToAdd = `  Future<void> _showManualEmailDialog() async {
    final emailCtrl = TextEditingController();
    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Google Email Verification', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: TextField(
          controller: emailCtrl,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: 'Google Account Email',
            hintText: 'yourname@gmail.com',
            prefixIcon: Icon(Icons.email_outlined),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final email = emailCtrl.text.trim();
              Navigator.pop(ctx);
              if (email.isNotEmpty && email.contains('@')) {
                _handleDirectSignIn(email: email);
              }
            },
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  // Fallback sign in for Admin or specific email`;

c = c.replace('  // Fallback sign in for Admin or specific email', methodToAdd);

// Add button below the Google sign in button
const needle = "                                color: Color(0xFF3C4043),\n                              ),\n                            ),\n                          ],\n                        ),\n                ),\n              ),";

const replacement = `                                color: Color(0xFF3C4043),
                              ),
                            ),
                          ],
                        ),
                ),
              ),

              const SizedBox(height: 14),
              TextButton(
                onPressed: _isLoading ? null : _showManualEmailDialog,
                child: Text(
                  'Or sign in with Google email manually',
                  style: TextStyle(
                    fontSize: 12.5,
                    color: isDark ? Colors.white60 : AppTheme.primaryNavy.withValues(alpha: 0.8),
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),`;

if (c.includes(needle)) {
  c = c.replace(needle, replacement);
  fs.writeFileSync(targetPath, c, 'utf8');
  console.log('Successfully updated auth_screen.dart with manual email dialog and button');
} else {
  // Try CRLF
  const needleCRLF = needle.replace(/\n/g, '\r\n');
  const replacementCRLF = replacement.replace(/\n/g, '\r\n');
  if (c.includes(needleCRLF)) {
    c = c.replace(needleCRLF, replacementCRLF);
    fs.writeFileSync(targetPath, c, 'utf8');
    console.log('Successfully updated auth_screen.dart with manual email dialog and button (CRLF)');
  } else {
    console.log('Could not find exact needle in auth_screen.dart');
  }
}
