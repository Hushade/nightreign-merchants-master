import csv
import json
import unittest
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib import parse, request

ROOT = Path(__file__).resolve().parents[1]


def load_expected_image_files():
    with (ROOT / 'data' / 'asset-map.json').open('r', encoding='utf-8') as f:
        asset_map = json.load(f)

    expected = set(asset_map.values())

    for csv_name in ['NormalMerchants.csv', 'VillageMerchants.csv', 'GoldenMerchants.csv']:
        with (ROOT / 'data' / csv_name).open('r', encoding='utf-8', newline='') as f:
            reader = csv.reader(f)
            for row in reader:
                if len(row) < 2:
                    continue

                product_name = (row[1] or '').strip()
                if product_name in asset_map:
                    expected.add(asset_map[product_name])

    return sorted(expected)


class FetchAllPossibleImagesTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(
            ('127.0.0.1', 0),
            partial(SimpleHTTPRequestHandler, directory=str(ROOT)),
        )
        cls.port = cls.server.server_address[1]
        cls.server_thread = Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def test_every_possible_image_is_fetchable(self):
        expected_files = load_expected_image_files()
        self.assertTrue(expected_files, 'No candidate images found. Check the asset-map.json and CSV files.')

        failures = []
        for file_name in expected_files:
            encoded_path = parse.quote(file_name, safe='')
            url = f'http://127.0.0.1:{self.port}/images/{encoded_path}'
            try:
                with request.urlopen(url, timeout=10) as response:
                    status = getattr(response, 'status', response.getcode())
                    if status != 200:
                        failures.append(f'{file_name}: HTTP {status}')
            except Exception as e:
                failures.append(f'{file_name}: {e}')

        if failures:
            with open(ROOT / 'tests' / 'test_fetch_images.log', 'w', encoding='utf-8') as log_file:
                log_file.writelines('\n'.join(failures))
            self.fail('The following images could not be fetched:\n' + '\n'.join(failures[:20]))



if __name__ == '__main__':
    unittest.main(verbosity=2)
