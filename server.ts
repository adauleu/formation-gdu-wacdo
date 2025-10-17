import app from './index.ts';

const PORT = process.env.PORT || 3000

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
