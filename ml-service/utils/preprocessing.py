import re
import string
from typing import List

class TextPreprocessor:
    """
    Preprocessing teks untuk klasifikasi tiket helpdesk
    """
    
    def __init__(self):
        self.stopwords = self._get_stopwords()
    
    def clean_text(self, text: str) -> str:
        """
        Membersihkan teks dari noise
        """
        if not isinstance(text, str):
            return ""
        
        # Lowercase
        text = text.lower()
        
        # Hapus URL
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Hapus email
        text = re.sub(r'\S+@\S+', '', text)
        
        # Hapus angka (opsional, untuk beberapa kasus)
        # text = re.sub(r'\d+', '', text)
        
        # Hapus punctuation
        text = text.translate(str.maketrans('', '', string.punctuation))
        
        # Hapus whitespace berlebih
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def remove_stopwords(self, text: str) -> str:
        """
        Menghapus kata-kata stop words bahasa Indonesia
        """
        words = text.split()
        filtered_words = [word for word in words if word not in self.stopwords]
        return ' '.join(filtered_words)
    
    def preprocess(self, text: str, remove_stopwords: bool = True) -> str:
        """
        Full preprocessing pipeline
        """
        # Clean text
        text = self.clean_text(text)
        
        # Remove stopwords
        if remove_stopwords:
            text = self.remove_stopwords(text)
        
        return text
    
    def _get_stopwords(self) -> set:
        """
        Daftar stopwords bahasa Indonesia
        """
        return {
            'ada', 'adalah', 'adanya', 'adapun', 'agak', 'agaknya', 'agar', 'akan',
            'akankah', 'akhir', 'akhiri', 'akhirnya', 'aku', 'akulah', 'amat',
            'amatlah', 'anda', 'andalah', 'antar', 'antara', 'antaranya', 'apa',
            'apaan', 'apabila', 'apakah', 'apalagi', 'apatah', 'artinya', 'asal',
            'asalkan', 'atas', 'atau', 'ataukah', 'ataupun', 'awal', 'awalnya',
            'bagai', 'bagaikan', 'bagaimana', 'bagaimanakah', 'bagaimanapun',
            'bagi', 'bagian', 'bahkan', 'bahwa', 'bahwasanya', 'baik', 'bakal',
            'bakalan', 'balik', 'banyak', 'bapak', 'baru', 'bawah', 'beberapa',
            'begini', 'beginian', 'beginikah', 'beginilah', 'begitu', 'begitukah',
            'begitulah', 'begitupun', 'bekerja', 'belakang', 'belakangan', 'belum',
            'belumlah', 'benar', 'benarkah', 'benarlah', 'berada', 'berakhir',
            'berakhirlah', 'berakhirnya', 'berapa', 'berapakah', 'berapalah',
            'berapapun', 'berarti', 'berawal', 'berbagai', 'berdatangan', 'beri',
            'berikan', 'berikut', 'berikutnya', 'berjumlah', 'berkali-kali',
            'berkata', 'berkehendak', 'berkeinginan', 'berkenaan', 'berlainan',
            'berlalu', 'berlangsung', 'berlebihan', 'bermacam', 'bermacam-macam',
            'bermaksud', 'bermula', 'bersama', 'bersama-sama', 'bersiap',
            'bersiap-siap', 'bertanya', 'bertanya-tanya', 'berturut', 'berturut-turut',
            'bertutur', 'berujar', 'berupa', 'besar', 'betul', 'betulkah',
            'biasa', 'biasanya', 'bila', 'bilakah', 'bisa', 'bisakah', 'boleh',
            'bolehkah', 'bolehlah', 'buat', 'bukan', 'bukankah', 'bukanlah',
            'bukannya', 'bulan', 'bung', 'cara', 'caranya', 'cukup', 'cukupkah',
            'cukuplah', 'cuma', 'dahulu', 'dalam', 'dan', 'dapat', 'dari',
            'daripada', 'datang', 'dekat', 'demi', 'demikian', 'demikianlah',
            'dengan', 'depan', 'di', 'dia', 'diakhiri', 'diakhirinya', 'dialah',
            'diantara', 'diantaranya', 'diberi', 'diberikan', 'diberikannya',
            'dibuat', 'dibuatnya', 'didapat', 'didatangkan', 'digunakan',
            'diibaratkan', 'diibaratkannya', 'diingat', 'diingatkan', 'diinginkan',
            'dijawab', 'dijelaskan', 'dijelaskannya', 'dikarenakan', 'dikatakan',
            'dikatakannya', 'dikerjakan', 'diketahui', 'diketahuinya', 'dilakukan',
            'dilalui', 'dilihat', 'dimaksud', 'dimaksudkan', 'dimaksudkannya',
            'dimaksudnya', 'diminta', 'dimintai', 'dimisalkan', 'dimulai',
            'dimulailah', 'dimulainya', 'dimungkinkan', 'dini', 'dipastikan',
            'diperbuat', 'diperbuatnya', 'dipergunakan', 'diperkirakan',
            'diperlihatkan', 'diperlukan', 'diperlukannya', 'dipersoalkan',
            'dipertanyakan', 'dipunyai', 'diri', 'dirinya', 'disampaikan',
            'disebut', 'disebutkan', 'disebutkannya', 'disini', 'disinilah',
            'ditambahkan', 'ditandaskan', 'ditanya', 'ditanyai', 'ditanyakan',
            'ditegaskan', 'ditujukan', 'ditunjuk', 'ditunjuki', 'ditunjukkan',
            'ditunjukkannya', 'ditunjuknya', 'dituturkan', 'dituturkannya',
            'diucapkan', 'diucapkannya', 'diungkapkan', 'dong', 'dua', 'dulu',
            'empat', 'enggak', 'enggaknya', 'entah', 'entahlah', 'guna',
            'gunakan', 'hal', 'hampir', 'hanya', 'hanyalah', 'hari', 'harus',
            'haruslah', 'harusnya', 'hendak', 'hendaklah', 'hendaknya', 'hingga',
            'ia', 'ialah', 'ibarat', 'ibaratkan', 'ibaratnya', 'ibu', 'ikut',
            'ingat', 'ingat-ingat', 'ingin', 'inginkah', 'inginkan', 'ini',
            'inikah', 'inilah', 'itu', 'itukah', 'itulah', 'jadi', 'jadilah',
            'jadinya', 'jangan', 'jangankan', 'janganlah', 'jauh', 'jawab',
            'jawaban', 'jawabnya', 'jelas', 'jelaskan', 'jelaslah', 'jelasnya',
            'jika', 'jikalau', 'juga', 'jumlah', 'jumlahnya', 'justru', 'kala',
            'kalau', 'kalaulah', 'kalaupun', 'kalian', 'kami', 'kamilah', 'kamu',
            'kamulah', 'kan', 'kapan', 'kapankah', 'kapanpun', 'karena',
            'karenanya', 'kasus', 'kata', 'katakan', 'katakanlah', 'katanya',
            'ke', 'keadaan', 'kebetulan', 'kecil', 'kedua', 'keduanya',
            'keinginan', 'kelamaan', 'kelihatan', 'kelihatannya', 'kelima',
            'keluar', 'kembali', 'kemudian', 'kemungkinan', 'kemungkinannya',
            'kenapa', 'kepada', 'kepadanya', 'kesampaian', 'keseluruhan',
            'keseluruhannya', 'keterlaluan', 'ketika', 'khususnya', 'kini',
            'kinilah', 'kira', 'kira-kira', 'kiranya', 'kita', 'kitalah',
            'kok', 'kurang', 'lagi', 'lagian', 'lah', 'lain', 'lainnya',
            'lalu', 'lama', 'lamanya', 'lanjut', 'lanjutnya', 'lebih', 'lewat',
            'lima', 'luar', 'macam', 'maka', 'makanya', 'makin', 'malah',
            'malahan', 'mampu', 'mampukah', 'mana', 'manakala', 'manalagi',
            'masa', 'masalah', 'masalahnya', 'masih', 'masihkah', 'masing',
            'masing-masing', 'mau', 'maupun', 'melainkan', 'melakukan', 'melalui',
            'melihat', 'melihatnya', 'memang', 'memastikan', 'memberi',
            'memberikan', 'membuat', 'memerlukan', 'memiliki', 'meminta',
            'memintakan', 'memisalkan', 'memperbuat', 'mempergunakan',
            'memperkirakan', 'memperlihatkan', 'mempersiapkan', 'mempersoalkan',
            'mempertanyakan', 'mempunyai', 'memulai', 'memungkinkan', 'menaiki',
            'menambahkan', 'menandaskan', 'menanti', 'menanti-nanti', 'menantikan',
            'menanya', 'menanyai', 'menanyakan', 'mendapat', 'mendapatkan',
            'mendatang', 'mendatangi', 'mendatangkan', 'menegaskan', 'mengakhiri',
            'mengapa', 'mengatakan', 'mengatakannya', 'mengenai', 'mengerjakan',
            'mengetahui', 'menggunakan', 'menghendaki', 'mengibaratkan',
            'mengibaratkannya', 'mengingat', 'mengingatkan', 'menginginkan',
            'mengira', 'mengucapkan', 'mengucapkannya', 'mengungkapkan',
            'menjadi', 'menjawab', 'menjelaskan', 'menuju', 'menunjuk',
            'menunjuki', 'menunjukkan', 'menunjuknya', 'menurut', 'menuturkan',
            'menyampaikan', 'menyangkut', 'menyatakan', 'menyebutkan',
            'menyeluruh', 'menyiapkan', 'merasa', 'mereka', 'merekalah',
            'merupakan', 'meski', 'meskipun', 'meyakini', 'meyakinkan', 'minta',
            'mirip', 'misal', 'misalkan', 'misalnya', 'mohon', 'mulai', 'mulailah',
            'mulainya', 'mungkin', 'mungkinkah', 'nah', 'naik', 'namun', 'nanti',
            'nantinya', 'nyaris', 'nyatanya', 'oleh', 'olehnya', 'orang',
            'pada', 'padahal', 'padanya', 'pak', 'paling', 'panjang', 'pantas',
            'para', 'pasti', 'pastilah', 'penting', 'pentingnya', 'per', 'percuma',
            'perlu', 'perlukah', 'perlunya', 'pernah', 'persoalan', 'pertama',
            'pertama-tama', 'pertanyaan', 'pertanyakan', 'pihak', 'pihaknya',
            'pukul', 'pula', 'pun', 'punya', 'rasa', 'rasanya', 'rata', 'rupanya',
            'saat', 'saatnya', 'saja', 'sajalah', 'saling', 'sama', 'sama-sama',
            'sambil', 'sampai', 'sampai-sampai', 'sampaikan', 'sana', 'sangat',
            'sangatlah', 'satu', 'saya', 'sayalah', 'se', 'sebab', 'sebabnya',
            'sebagai', 'sebagaimana', 'sebagainya', 'sebagian', 'sebaik',
            'sebaik-baiknya', 'sebaiknya', 'sebaliknya', 'sebanyak', 'sebegini',
            'sebegitu', 'sebelum', 'sebelumnya', 'sebenarnya', 'seberapa',
            'sebesar', 'sebetulnya', 'sebisanya', 'sebuah', 'sebut', 'sebutlah',
            'sebutnya', 'secara', 'secukupnya', 'sedang', 'sedangkan', 'sedemikian',
            'sedikit', 'sedikitnya', 'seenaknya', 'segala', 'segalanya', 'segera',
            'seharusnya', 'sehingga', 'seingat', 'sejak', 'sejauh', 'sejenak',
            'sejumlah', 'sekadar', 'sekadarnya', 'sekali', 'sekali-kali',
            'sekalian', 'sekaligus', 'sekalipun', 'sekarang', 'sekecil',
            'seketika', 'sekiranya', 'sekitar', 'sekitarnya', 'sekurang-kurangnya',
            'sekurangnya', 'sela', 'selain', 'selaku', 'selalu', 'selama',
            'selama-lamanya', 'selamanya', 'selanjutnya', 'seluruh', 'seluruhnya',
            'semacam', 'semakin', 'semampu', 'semampunya', 'semasa', 'semasih',
            'semata', 'semata-mata', 'semaunya', 'sementara', 'semisal', 'semisalnya',
            'sempat', 'semua', 'semuanya', 'semula', 'sendiri', 'sendirian',
            'sendirinya', 'seolah', 'seolah-olah', 'seorang', 'sepanjang',
            'sepantasnya', 'sepantasnyalah', 'seperlunya', 'seperti', 'sepertinya',
            'sepihak', 'sering', 'seringnya', 'serta', 'serupa', 'sesaat',
            'sesama', 'sesampai', 'sesegera', 'sesekali', 'seseorang', 'sesuatu',
            'sesuatunya', 'sesudah', 'sesudahnya', 'setelah', 'setempat',
            'setengah', 'seterusnya', 'setiap', 'setiba', 'setibanya', 'setidak-tidaknya',
            'setidaknya', 'setinggi', 'seusai', 'sewaktu', 'siap', 'siapa',
            'siapakah', 'siapapun', 'sini', 'sinilah', 'soal', 'soalnya',
            'suatu', 'sudah', 'sudahkah', 'sudahlah', 'supaya', 'tadi', 'tadinya',
            'tahu', 'tahun', 'tak', 'tambah', 'tambahnya', 'tampak', 'tampaknya',
            'tandas', 'tandasnya', 'tanpa', 'tanya', 'tanyakan', 'tanyanya',
            'tapi', 'tegas', 'tegasnya', 'telah', 'tempat', 'tengah', 'tentang',
            'tentu', 'tentulah', 'tentunya', 'tepat', 'terakhir', 'terasa',
            'terbanyak', 'terdahulu', 'terdapat', 'terdiri', 'terhadap',
            'terhadapnya', 'teringat', 'teringat-ingat', 'terjadi', 'terjadilah',
            'terjadinya', 'terkira', 'terlalu', 'terlebih', 'terlihat', 'termasuk',
            'ternyata', 'tersampaikan', 'tersebut', 'tersebutlah', 'tertentu',
            'tertuju', 'terus', 'terutama', 'tetap', 'tetapi', 'tiap', 'tiba',
            'tiba-tiba', 'tidak', 'tidakkah', 'tidaklah', 'tiga', 'tinggi',
            'toh', 'tunjuk', 'turut', 'tutur', 'tuturnya', 'ucap', 'ucapnya',
            'ujar', 'ujarnya', 'umum', 'umumnya', 'ungkap', 'ungkapnya', 'untuk',
            'usah', 'usai', 'waduh', 'wah', 'wahai', 'waktu', 'waktunya', 'walau',
            'walaupun', 'wong', 'yaitu', 'yakin', 'yakni', 'yang',
        }