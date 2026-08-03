import unittest
from PIL import Image

from redact_results import apply_masks, fit_canvas, process_image


class ApplyMasksTest(unittest.TestCase):
    def test_paints_solid_rectangle_over_fractional_region(self):
        image = Image.new("RGB", (200, 100), (255, 255, 255))
        apply_masks(image, [[0.25, 0.5, 0.5, 0.25]])
        self.assertEqual(image.getpixel((100, 62)), (22, 33, 46))

    def test_leaves_pixels_outside_the_region_untouched(self):
        image = Image.new("RGB", (200, 100), (255, 255, 255))
        apply_masks(image, [[0.25, 0.5, 0.5, 0.25]])
        self.assertEqual(image.getpixel((10, 10)), (255, 255, 255))
        self.assertEqual(image.getpixel((190, 90)), (255, 255, 255))

    def test_applies_every_region_in_the_list(self):
        image = Image.new("RGB", (100, 100), (255, 255, 255))
        apply_masks(image, [[0.0, 0.0, 0.2, 0.2], [0.8, 0.8, 0.2, 0.2]])
        self.assertEqual(image.getpixel((5, 5)), (22, 33, 46))
        self.assertEqual(image.getpixel((95, 95)), (22, 33, 46))


class FitCanvasTest(unittest.TestCase):
    def test_returns_exactly_the_requested_canvas_size(self):
        wide = Image.new("RGB", (1820, 900), (10, 20, 30))
        self.assertEqual(fit_canvas(wide, (1200, 675)).size, (1200, 675))

    def test_pads_with_white_instead_of_cropping(self):
        tall = Image.new("RGB", (100, 1000), (10, 20, 30))
        sheet = fit_canvas(tall, (848, 1200))
        self.assertEqual(sheet.getpixel((5, 600)), (255, 255, 255))

    def test_keeps_the_whole_source_visible(self):
        source = Image.new("RGB", (400, 200), (10, 20, 30))
        sheet = fit_canvas(source, (848, 1200))
        self.assertEqual(sheet.getpixel((424, 600)), (10, 20, 30))


class ProcessImageTest(unittest.TestCase):
    def test_masks_then_normalises_in_one_pass(self):
        with Image.new("RGB", (400, 200), (255, 255, 255)) as source:
            source.save("/tmp/redact-sample.jpg", quality=95)
        result = process_image("/tmp/redact-sample.jpg", [[0.0, 0.0, 1.0, 1.0]], (1200, 675))
        self.assertEqual(result.size, (1200, 675))
        self.assertLess(sum(result.getpixel((600, 337))), 120)


if __name__ == "__main__":
    unittest.main()
