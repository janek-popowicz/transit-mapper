class Node:
    def __init__(self, id:str, label:str, coordinates:tuple, type:str="standard", size:int=10,
                  label_position:tuple=(10 ,10), label_text_degree:int=90):
        """_summary_

        Args:
            id (str): node id
            label (str): name of the station
            coordinates (tuple): coords
            type (str, optional): Can be: standard, linelabel, invisible, interchange, continuation, onedirection. Defaults to "standard".
            size (int, optional): Can be any int >=1. Is a pixel size of this station. Defaults to 10.
            label_position (int, optional): Can be any number. (10, 0) means right, (-10, -10) is bottomleft. Defaults to topright (10, 10).
            label_text_degree (int, optional): Can be a number from 0 to 360. 90 is horizontally normal, 270 is horizontal upside down. Defaults to 90.
        """
        self.id = id
        self.label = label
        self.coordinates = coordinates
        self.type = type
        self.size = size
        self.label_position = label_position
        self.label_text_degree = label_text_degree